use crate::chain_config::{self, ChainConfig};
use crate::evm_rpc::get_payment_logs_for_block;
use crate::logger::{error, info};
use crate::tasks::{add_task, Task, TaskError, TaskExecutor, TaskResult, TaskType};
use crate::{
    declarations::evm_rpc::{GetLogsResult, LogEntry, MultiGetLogsResult},
    eth::{remove_address_padding, EthAddress},
    logger::warn,
    run::run::{vec_to_run_id, PaymentVerifiedStatus, Run},
    ETH_PAYMENT_EVENT_SIGNATURE,
};
use ethers_core::abi::ParamType;
use futures::Future;
use serde::{Deserialize, Serialize};
use std::pin::Pin;
use thiserror::Error;

const CREATE_ATTESTATION_RETRY_INTERVAL: u64 = 15_000_000_000; // 15 seconds
const CREATE_ATTESTATION_MAX_RETRIES: u32 = 3;

#[derive(Error, Debug)]
pub enum PaymentError {
    #[error("{0}")]
    Warn(String),
    #[error("{0}")]
    Fail(String),
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ProcessRunPaymentArgs {
    pub block_to_process: u128,
    pub from_address: [u8; 20],
    pub run_id: [u8; 12],
}

pub struct ProcessRunPaymentExecutor {}

impl TaskExecutor for ProcessRunPaymentExecutor {
    fn execute(
        &self,
        args: Vec<u8>,
    ) -> Pin<Box<dyn Future<Output = Result<TaskResult, TaskError>> + Send>> {
        Box::pin(async move {
            let args: ProcessRunPaymentArgs = bincode::deserialize(&args)
                .map_err(|_| TaskError::Failed("Invalid arguments".to_string()))?;

            let run = Run::get_by_id(&args.run_id).ok_or(TaskError::Failed(
                "CreateAttestationExecutor: Run not found".to_string(),
            ))?;

            let chain_config = chain_config::get(run.chain_id).ok_or(TaskError::Failed(
                "CreateAttestationExecutor: Chain config not found".to_string(),
            ))?;

            match process_run_payment(args.clone(), &chain_config).await {
                Ok(_) => {
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

                    Ok(TaskResult::success())
                }
                Err(e) => match e {
                    PaymentError::Warn(e) => {
                        warn(format!("ProcessRunPaymentsExecutor: {}", e).as_str());
                        Ok(TaskResult::retry())
                    }
                    PaymentError::Fail(e) => {
                        error(format!("ProcessRunPaymentsExecutor: {}", e).as_str());
                        Ok(TaskResult::cancel())
                    }
                },
            }
        })
    }
}

pub async fn process_run_payment(
    args: ProcessRunPaymentArgs,
    chain_config: &ChainConfig,
) -> Result<(), PaymentError> {
    let logs_result = get_payment_logs_for_block(args.block_to_process, chain_config)
        .await
        .map_err(|e| PaymentError::Fail(format!("Error fetching logs: {:?}", e)))?;

    match logs_result.0 {
        MultiGetLogsResult::Consistent(log_result) => match log_result {
            GetLogsResult::Ok(entries) => {
                for entry in entries {
                    match process_log_entry(&entry, &args, chain_config) {
                        Ok(_) => {
                            info("Payment registered successfully");
                            return Ok(());
                        }
                        // Do not return on error as we may have multiple logs to process
                        Err(err) => {
                            log_entry_process_warn(&entry, err.to_string());
                        }
                    }
                }
            }
            GetLogsResult::Err(err) => {
                return Err(PaymentError::Warn(format!(
                    "Error fetching logs: {:?}",
                    err
                )));
            }
        },
        MultiGetLogsResult::Inconsistent(_) => {
            return Err(PaymentError::Warn(
                "Fetching logs returned inconsistent results".to_string(),
            ));
        }
    }

    Err(PaymentError::Warn(
        "No matching payment logs found".to_string(),
    ))
}

fn process_log_entry(
    entry: &LogEntry,
    args: &ProcessRunPaymentArgs,
    chain_config: &ChainConfig,
) -> Result<(), PaymentError> {
    if entry.address.to_lowercase() != chain_config.payment_contract.to_lowercase() {
        return Err(PaymentError::Warn(
            "Payment log entry address does not match the expected address".to_string(),
        ));
    }

    if entry.topics.len() < 2 {
        return Err(PaymentError::Warn(
            "Not enough topics in payment log entry".to_string(),
        ));
    }

    let event_signature = &entry.topics[0];
    if !event_signature
        .to_lowercase()
        .eq(ETH_PAYMENT_EVENT_SIGNATURE)
    {
        return Err(PaymentError::Warn(
            "Payment event signature does not match the expected signature".to_string(),
        ));
    }

    let event_from_address = &entry.topics[1];
    let event_from_address = remove_address_padding(event_from_address);
    let event_from_address = EthAddress::new(&event_from_address).map_err(|_| {
        PaymentError::Warn("Payment event from address is not a valid address".to_string())
    })?;

    let from_address = EthAddress::from(args.from_address);

    if event_from_address.as_byte_array() != from_address.as_byte_array() {
        return Err(PaymentError::Warn(
            "Payment from address does not match the expected address".to_string(),
        ));
    }

    // Hex string to raw bytes
    if let Ok(data) = ethers_core::utils::hex::decode(entry.data.clone()) {
        // Raw bytes to two parameters, payment amount and run_id
        if let Ok(decoded_data) =
            ethers_core::abi::decode(&[ParamType::Uint(256), ParamType::FixedBytes(12)], &data)
        {
            if decoded_data.len() < 2 {
                return Err(PaymentError::Warn(
                    "Decoded data has less than 2 elements".to_string(),
                ));
            }

            // run_id
            let event_run_id = decoded_data[1].clone().into_fixed_bytes().ok_or_else(|| {
                PaymentError::Warn("Payment run_id is the wrong data type".to_string())
            })?;
            let event_run_id = vec_to_run_id(event_run_id).map_err(|_| {
                PaymentError::Warn("Payment run_id is not a valid run_id".to_string())
            })?;

            if event_run_id != args.run_id {
                return Err(PaymentError::Warn(
                    "Payment run_id does not match the expected run_id".to_string(),
                ));
            }

            // amount
            let event_amount = decoded_data[0].clone().into_uint().ok_or_else(|| {
                PaymentError::Fail("Payment amount is the wrong data type".to_string())
            })?;
            let event_amount: u128 = event_amount
                .try_into()
                .map_err(|_| PaymentError::Fail("Payment amount is too large".to_string()))?;

            let mut run =
                Run::get(&event_from_address.as_byte_array(), &event_run_id).ok_or_else(|| {
                    PaymentError::Fail("Found payment for non-existent run".to_string())
                })?;

            if run.payment_verified_status == Some(PaymentVerifiedStatus::Verified) {
                return Err(PaymentError::Fail(
                    "Payment already verified for this run".to_string(),
                ));
            }

            if event_amount >= run.fee {
                run.payment_transaction_hash
                    .clone_from(&entry.transactionHash);
                run.payment_verified_status = Some(PaymentVerifiedStatus::Verified);
                Run::update(&run);
                return Ok(());
            } else {
                return Err(PaymentError::Fail(
                    "Payment did not cover the cost of the run".to_string(),
                ));
            }
        }
        return Err(PaymentError::Warn("Failed to decode log data".to_string()));
    }
    Err(PaymentError::Warn(
        "Failed to decode log hex data".to_string(),
    ))
}

fn log_entry_process_warn(entry: &LogEntry, error_message: String) {
    warn(
        format!(
            "Error processing log entry: {:?} with error: {}",
            entry, error_message
        )
        .as_str(),
    );
}
