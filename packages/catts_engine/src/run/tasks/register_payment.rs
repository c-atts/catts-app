use crate::chain_config::{self, ChainConfig};
use crate::declarations::evm_rpc::LogEntry;
use crate::evm::rpc::get_run_payment_logs;
use crate::logger::{self};
use crate::run::{self, PaymentVerifiedStatus, Run};
use crate::tasks::{add_task, Task, TaskError, TaskExecutor, TaskType};
use crate::{
    eth_address::{remove_address_padding, EthAddress},
    ETH_PAYMENT_EVENT_SIGNATURE,
};
use ethers_core::abi::ParamType;
use futures::Future;
use serde::{Deserialize, Serialize};
use std::pin::Pin;

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

            let run = run::get_by_id(&args.run_id).map_err(|e| TaskError::Cancel(e.to_string()))?;

            let chain_config =
                chain_config::get(run.chain_id).map_err(|e| TaskError::Cancel(e.to_string()))?;

            let payment_logs = get_run_payment_logs(args.block_to_process, &chain_config)
                .await
                .map_err(|e| TaskError::Retry(e.to_string()))?;

            for entry in payment_logs {
                let maybe_run = process_log_entry(&entry, &args, &chain_config)?;
                if maybe_run.is_some() {
                    logger::info("Payment log entry processed successfully");
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
            }

            Err(TaskError::Cancel("No valid log entries found".to_string()))
        })
    }
}

fn process_log_entry(
    entry: &LogEntry,
    args: &ProcessRunPaymentArgs,
    chain_config: &ChainConfig,
) -> Result<Option<Run>, TaskError> {
    if entry.address.to_lowercase() != chain_config.payment_contract.to_lowercase() {
        logger::debug("Payment log entry address does not match the expected address.");
        return Ok(None);
    }

    if entry.topics.len() < 2 {
        logger::debug("Not enough topics in payment log entry");
        return Ok(None);
    }

    let event_signature = &entry.topics[0];
    if !event_signature
        .to_lowercase()
        .eq(ETH_PAYMENT_EVENT_SIGNATURE)
    {
        logger::debug("Payment log entry signature does not match the expected signature.");
        return Ok(None);
    }

    let event_from_address = &entry.topics[1];
    let event_from_address = remove_address_padding(event_from_address);
    let event_from_address = match EthAddress::new(&event_from_address) {
        Ok(address) => address,
        Err(_) => {
            logger::debug("Payment log entry from address is not a valid address");
            return Ok(None);
        }
    };

    let from_address = EthAddress::from(args.from_address);

    if event_from_address.as_byte_array() != from_address.as_byte_array() {
        logger::debug("Payment from address does not match the expected address");
        return Ok(None);
    }

    // Hex string to raw bytes
    if let Ok(data) = ethers_core::utils::hex::decode(entry.data.clone()) {
        // Raw bytes to two parameters, payment amount and run_id
        if let Ok(decoded_data) =
            ethers_core::abi::decode(&[ParamType::Uint(256), ParamType::FixedBytes(12)], &data)
        {
            if decoded_data.len() < 2 {
                logger::debug("Decoded data has less than 2 elements");
                return Ok(None);
            }

            let event_run_id = match decoded_data[1].clone().into_fixed_bytes() {
                Some(bytes) => bytes,
                None => {
                    logger::debug("Payment run_id is the wrong data type");
                    return Ok(None);
                }
            };

            let event_run_id = match run::vec_to_run_id(event_run_id) {
                Ok(run_id) => run_id,
                Err(_) => {
                    logger::debug("Payment run_id is not a valid run_id");
                    return Ok(None);
                }
            };

            if event_run_id != args.run_id {
                logger::debug("Payment run_id does not match the expected run_id");
                return Ok(None);
            }

            let event_amount = match decoded_data[0].clone().into_uint() {
                Some(amount) => amount,
                None => {
                    logger::debug("Payment amount is the wrong data type");
                    return Ok(None);
                }
            };

            let event_amount: u128 = match event_amount.try_into() {
                Ok(amount) => amount,
                Err(_) => {
                    logger::debug("Payment amount is too large");
                    return Ok(None);
                }
            };

            let mut run = match run::get(&event_from_address, &event_run_id) {
                Ok(run) => run,
                Err(_) => {
                    logger::debug("Found payment for non-existent run");
                    return Ok(None);
                }
            };

            if run.payment_verified_status == Some(PaymentVerifiedStatus::Verified) {
                return Err(TaskError::Cancel(
                    "Payment already verified for this run".to_string(),
                ));
            }

            let user_fee = match run.user_fee.clone() {
                Some(fee) => fee,
                None => {
                    return Err(TaskError::Cancel(
                        "Run does not have a user fee".to_string(),
                    ));
                }
            };

            if event_amount >= user_fee {
                run.payment_transaction_hash
                    .clone_from(&entry.transactionHash);
                run.payment_verified_status = Some(PaymentVerifiedStatus::Verified);
                return Ok(Some(run::save(run)));
            } else {
                return Err(TaskError::Cancel(
                    "Payment did not cover the cost of the run".to_string(),
                ));
            }
        }
        logger::debug("Failed to decode log data");
        return Ok(None);
    }
    logger::debug("Failed to decode log hex data");
    Ok(None)
}
