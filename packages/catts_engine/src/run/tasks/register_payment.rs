use crate::chain_config::{self, ChainConfig};
use crate::declarations::evm_rpc::LogEntry;
use crate::evm::rpc::get_run_payment_logs;
use crate::logger::{self};
use crate::run::{self, Run, RunStatus};
use crate::tasks::{add_task, Task, TaskError, TaskExecutor, TaskType};
use crate::{
    eth_address::{remove_address_padding, EthAddress},
    ETH_PAYMENT_EVENT_SIGNATURE,
};
use anyhow::{anyhow, bail, Result};
use ethers_core::abi::ParamType;
use futures::Future;
use serde::{Deserialize, Serialize};
use std::pin::Pin;

use super::util::save_error_and_cancel;

const CREATE_ATTESTATION_RETRY_INTERVAL: u64 = 15_000_000_000; // 15 seconds
const CREATE_ATTESTATION_MAX_RETRIES: u32 = 3;

#[derive(Serialize, Deserialize, Clone)]
pub struct ProcessRunPaymentArgs {
    pub block_to_process: u128,
    pub from_address: [u8; 20],
    pub run_id: [u8; 12],
}

pub struct RegisterPaymentExecutor {}

impl TaskExecutor for RegisterPaymentExecutor {
    fn execute(&self, task: Task) -> Pin<Box<dyn Future<Output = Result<(), TaskError>> + Send>> {
        Box::pin(async move {
            let args: ProcessRunPaymentArgs = bincode::deserialize(&task.args)
                .map_err(|_| TaskError::Cancel("Invalid arguments".to_string()))?;

            let mut run = run::get(&args.run_id).map_err(|e| TaskError::Cancel(e.to_string()))?;

            let chain_config = chain_config::get(run.chain_id)
                .map_err(|e| save_error_and_cancel(&args.run_id, e.to_string()))?;

            let payment_logs = get_run_payment_logs(args.block_to_process, &chain_config)
                .await
                .map_err(|e| TaskError::Retry(e.to_string()))?;

            for entry in payment_logs {
                if entry.transactionHash != run.payment_transaction_hash {
                    continue;
                }

                process_log_entry(&entry, &args, &chain_config)
                    .map_err(|e| save_error_and_cancel(&args.run_id, e.to_string()))?;

                run.payment_transaction_hash = entry.transactionHash;
                run.payment_block_number = entry.blockNumber;
                run.payment_log_index = entry.logIndex;

                logger::info("Payment log entry processed successfully");

                run::update(run).unwrap();

                add_task(
                    0, // Run ASAP
                    Task {
                        task_type: TaskType::CreateAttestation,
                        args: args.run_id.to_vec(),
                        max_retries: CREATE_ATTESTATION_MAX_RETRIES,
                        execute_count: 0,
                        retry_interval: CREATE_ATTESTATION_RETRY_INTERVAL,
                    },
                );
                return Ok(());
            }

            Err(TaskError::Cancel("No valid log entries found".to_string()))
        })
    }
}

fn process_log_entry(
    entry: &LogEntry,
    args: &ProcessRunPaymentArgs,
    chain_config: &ChainConfig,
) -> Result<Run> {
    if entry.address.to_lowercase() != chain_config.payment_contract.to_lowercase() {
        bail!("Payment log entry address does not match the expected address");
    }

    if entry.topics.len() < 2 {
        bail!("Not enough topics in payment log entry");
    }

    let event_signature = &entry.topics[0];
    if !event_signature
        .to_lowercase()
        .eq(ETH_PAYMENT_EVENT_SIGNATURE)
    {
        bail!("Payment log entry signature does not match the expected signature");
    }

    let event_from_address = &entry.topics[1];
    let event_from_address = remove_address_padding(event_from_address);
    let event_from_address = match EthAddress::new(&event_from_address) {
        Ok(address) => address,
        Err(_) => {
            bail!("Payment log entry from address is not a valid address");
        }
    };

    let from_address = EthAddress::from(args.from_address);

    if event_from_address.as_byte_array() != from_address.as_byte_array() {
        bail!("Payment log entry from address does not match the expected address");
    }

    // Hex string to raw bytes
    if let Ok(data) = ethers_core::utils::hex::decode(entry.data.clone()) {
        // Raw bytes to two parameters, payment amount and run_id
        if let Ok(decoded_data) =
            ethers_core::abi::decode(&[ParamType::Uint(256), ParamType::FixedBytes(12)], &data)
        {
            if decoded_data.len() < 2 {
                bail!("Decoded data has less than 2 elements");
            }

            let event_run_id = match decoded_data[1].clone().into_fixed_bytes() {
                Some(bytes) => bytes,
                None => {
                    bail!("Payment run_id is the wrong data type");
                }
            };

            let event_run_id = match run::vec_to_run_id(event_run_id) {
                Ok(run_id) => run_id,
                Err(_) => {
                    bail!("Payment run_id is not a valid run_id");
                }
            };

            if event_run_id != args.run_id {
                bail!("Payment run_id does not match the expected run_id");
            }

            let run = match run::get(&event_run_id) {
                Ok(run) => run,
                Err(_) => {
                    bail!("Found payment for non-existent run");
                }
            };

            if run.status() == RunStatus::PaymentPending {
                bail!("No payment transaction is registered for this run");
            }

            if run.status() > RunStatus::PaymentRegistered {
                bail!("Run payment is already verified");
            }

            let event_amount = match decoded_data[0].clone().into_uint() {
                Some(amount) => amount,
                None => {
                    bail!("Payment amount is the wrong data type");
                }
            };

            let event_amount: u128 = match event_amount.try_into() {
                Ok(amount) => amount,
                Err(_) => {
                    bail!("Payment amount is too large");
                }
            };

            let user_fee = match run.user_fee.clone() {
                Some(fee) => fee,
                None => {
                    bail!("Run does not have a user fee");
                }
            };

            if event_amount >= user_fee {
                return Ok(run);
            } else {
                bail!("Payment did not cover the cost of the run");
            }
        }
        bail!("Failed to decode log data");
    }
    Err(anyhow!("Failed to decode log hex data"))
}
