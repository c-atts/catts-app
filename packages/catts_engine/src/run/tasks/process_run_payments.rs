use crate::logger::warn;
use crate::tasks::{Task, TaskError, TaskExecutor, TaskOkResult, TaskType};
use crate::TASKS;
use crate::{
    declarations::evm_rpc::{
        evm_rpc, BlockTag, EthSepoliaService, GetLogsArgs, GetLogsResult, LogEntry,
        MultiGetLogsResult, RpcConfig, RpcServices,
    },
    eth::{remove_address_padding, EthAddress},
    logger::debug,
    run::run_service::{vec_to_run_id, PaymentVerifiedStatus, Run},
    ETH_DEFAULT_CALL_CYCLES, ETH_PAYMENT_CONTRACT_ADDRESS, ETH_PAYMENT_EVENT_SIGNATURE,
    STABLE_STATE,
};
use candid::Nat;
use ethers_core::abi::ParamType;
use futures::Future;
use ic_cdk::api::call::{call_with_payment, CallResult};
use std::pin::Pin;

const CREATE_ATTESTATION_RETRY_INTERVAL: u64 = 15_000_000_000; // 15 seconds
const CREATE_ATTESTATION_MAX_RETRIES: u32 = 3;

pub struct ProcessRunPaymentsExecutor {}

impl TaskExecutor for ProcessRunPaymentsExecutor {
    fn execute(
        &self,
        _args: Vec<u8>,
    ) -> Pin<Box<dyn Future<Output = Result<TaskOkResult, TaskError>> + Send>> {
        Box::pin(async move {
            match process_run_payments().await {
                Ok(_) => Ok(TaskOkResult::retry_allowed()),
                Err(e) => Err(TaskError::Failed(format!(
                    "ProcessRunPaymentsExecutor: Error checking payments: {}",
                    e
                ))),
            }
        })
    }
}

pub async fn process_run_payments() -> Result<(), String> {
    let mut latest_processed_block =
        STABLE_STATE.with_borrow(|state| state.get().eth_payments_latest_block.to_owned());

    let block_to_process = latest_processed_block.to_owned() + 1u8;
    let logs_result = get_latest_payment_logs(block_to_process).await?;

    match logs_result.0 {
        MultiGetLogsResult::Consistent(log_result) => match log_result {
            GetLogsResult::Ok(entries) => {
                for entry in entries {
                    process_log_entry(&entry).unwrap_or_else(|err| {
                        log_entry_process_warn(&entry, err);
                    });
                    if let Some(block_number) = entry.blockNumber {
                        if block_number > latest_processed_block {
                            debug("Updating latest processed block");
                            latest_processed_block = block_number;
                        }
                    }
                }
            }
            GetLogsResult::Err(err) => {
                return Err(format!("Error fetching logs: {:?}", err));
            }
        },
        MultiGetLogsResult::Inconsistent(_) => {
            debug("Fetching logs returned inconsistent results");
            return Ok(());
        }
    }

    STABLE_STATE.with_borrow_mut(|state_cell| {
        let mut current_state = state_cell.get().clone();
        current_state.eth_payments_latest_block = latest_processed_block;
        state_cell.set(current_state).unwrap();
    });

    Ok(())
}

pub async fn get_latest_payment_logs(from_block: Nat) -> Result<(MultiGetLogsResult,), String> {
    let res: CallResult<(MultiGetLogsResult,)> = call_with_payment(
        evm_rpc.0,
        "eth_getLogs",
        (
            RpcServices::EthSepolia(Some(vec![EthSepoliaService::BlockPi])),
            None::<RpcConfig>,
            GetLogsArgs {
                addresses: vec![ETH_PAYMENT_CONTRACT_ADDRESS.to_string()],
                fromBlock: Some(BlockTag::Number(from_block)),
                toBlock: None,
                topics: None,
            },
        ),
        ETH_DEFAULT_CALL_CYCLES,
    )
    .await;

    match res {
        Ok(result) => Ok(result),
        Err(err) => Err(format!("{:?}: {}", err.0, err.1)),
    }
}

fn process_log_entry(entry: &LogEntry) -> Result<(), String> {
    if entry.topics.len() < 2 {
        return Err("Not enough topics in log entry".to_string());
    }

    let event_signature = &entry.topics[0];
    if !event_signature
        .to_lowercase()
        .eq(ETH_PAYMENT_EVENT_SIGNATURE)
    {
        return Err("Event signature does not match the expected signature".to_string());
    }

    let paying_address = &entry.topics[1];
    let paying_address = remove_address_padding(paying_address);
    let paying_address = EthAddress::new(&paying_address)?;

    // Hex string to raw bytes
    if let Ok(data) = ethers_core::utils::hex::decode(entry.data.clone()) {
        // Raw bytes to parameters
        if let Ok(decoded_data) =
            ethers_core::abi::decode(&[ParamType::Uint(256), ParamType::FixedBytes(12)], &data)
        {
            if decoded_data.len() < 2 {
                return Err("Decoded data has less than 2 elements".to_string());
            }

            let amount = decoded_data[0]
                .clone()
                .into_uint()
                .ok_or_else(|| "Payment amount is the wrong data type".to_string())?;
            let amount: u128 = amount.try_into()?;

            let run_id = decoded_data[1]
                .clone()
                .into_fixed_bytes()
                .ok_or_else(|| "Payment run_id is the wrong data type".to_string())?;
            let run_id = vec_to_run_id(run_id)?;

            let mut run = Run::get(&paying_address.as_byte_array(), &run_id)
                .ok_or_else(|| "Found payment for non-existent run".to_string())?;

            if amount >= run.cost {
                debug("Payment registered");
                run.payment_transaction_hash = entry.transactionHash.clone();
                run.payment_verified_status = Some(PaymentVerifiedStatus::Verified);
                Run::update(&run);

                TASKS.with_borrow_mut(|tasks| {
                    tasks.insert(
                        0, // Run ASAP
                        Task {
                            task_type: TaskType::CreateAttestation,
                            args: run_id.to_vec(),
                            max_retries: CREATE_ATTESTATION_MAX_RETRIES,
                            execute_count: 0,
                            retry_interval: CREATE_ATTESTATION_RETRY_INTERVAL,
                        },
                    );
                });
            } else {
                return Err("Payment did not cover the cost of the run".to_string());
            }
        } else {
            return Err("Failed to decode log data".to_string());
        }
    } else {
        return Err("Failed to decode log hex data".to_string());
    }

    Ok(())
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
