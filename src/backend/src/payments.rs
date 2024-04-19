use crate::{
    declarations::evm_rpc::{
        evm_rpc, BlockTag, EthSepoliaService, GetLogsArgs, GetLogsResult, LogEntry,
        MultiGetLogsResult, RpcConfig, RpcServices,
    },
    eth::{remove_address_padding, EthAddress, EthAddressBytes},
    run::{vec_to_run_id, Run, RunId, RunStatus},
    ETH_DEFAULT_CALL_CYCLES, ETH_PAYMENT_CONTRACT_ADDRESS, ETH_PAYMENT_EVENT_SIGNATURE,
    STABLE_STATE,
};
use candid::Nat;
use ethers_core::abi::ParamType;
use ic_cdk::api::call::{call_with_payment, CallResult};

pub async fn is_run_payed(address: &EthAddressBytes, id: &RunId) -> Result<bool, String> {
    let is_payed = Run::get(address, id)
        .map(|run| run.payment_transaction_hash.is_some())
        .ok_or_else(|| "Run not found".to_string())?;

    if is_payed {
        return Ok(true);
    }

    check_latest_eth_payments().await?;

    Run::get(address, id)
        .map(|run| run.payment_transaction_hash.is_some())
        .ok_or_else(|| "Run not found".to_string())
}

pub async fn check_latest_eth_payments() -> Result<(), String> {
    let mut latest_processed_block: u32 =
        STABLE_STATE.with(|state| state.borrow().get().eth_payments_latest_block);

    let logs_result = get_latest_payment_logs(latest_processed_block).await?;

    match logs_result.0 {
        MultiGetLogsResult::Consistent(log_result) => match log_result {
            GetLogsResult::Ok(entries) => {
                for entry in entries {
                    process_log_entry(&entry).unwrap_or_else(|err| {
                        log_entry_process_error(&entry, err);
                    });
                    if let Some(block_number) = entry.blockNumber {
                        let block_number: u32 = block_number
                            .0
                            .try_into()
                            .map_err(|_| "Failed to convert block number to u32".to_string())?;
                        if block_number > latest_processed_block {
                            latest_processed_block = block_number;
                        }
                    }
                }
            }
            GetLogsResult::Err(err) => {
                return Err(format!("Error fetching logs: {:?}", err));
            }
        },
        MultiGetLogsResult::Inconsistent(results) => {
            for (_, log_result) in results {
                if let GetLogsResult::Ok(entries) = log_result {
                    for entry in entries {
                        process_log_entry(&entry).unwrap_or_else(|err| {
                            log_entry_process_error(&entry, err);
                        });
                        if let Some(block_number) = entry.blockNumber {
                            let block_number: u32 = block_number
                                .0
                                .try_into()
                                .map_err(|_| "Failed to convert block number to u32".to_string())?;
                            if block_number > latest_processed_block {
                                latest_processed_block = block_number;
                            }
                        }
                    }
                } else {
                    return Err("Error fetching logs".to_string());
                }
            }
        }
    }

    ic_cdk::println!(
        "Updating latest processed block to {}",
        latest_processed_block
    );

    STABLE_STATE.with_borrow_mut(|state_cell| {
        let mut current_state = state_cell.get().clone();
        current_state.eth_payments_latest_block = latest_processed_block;
        state_cell.set(current_state).unwrap();
    });

    Ok(())
}

pub async fn get_latest_payment_logs(from_block: u32) -> Result<(MultiGetLogsResult,), String> {
    let from_block = Nat::from(from_block);

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
                run.status = RunStatus::Paid;
                run.payment_transaction_hash = entry.transactionHash.clone();
                Run::update(run);
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

fn log_entry_process_error(entry: &LogEntry, error: String) {
    ic_cdk::println!(
        "Error processing log entry: {:?} with error: {}",
        entry,
        error
    );
}
