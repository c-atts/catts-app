use super::types::Run;
use crate::{
    chain_config::{self},
    declarations::evm_rpc::BlockTag,
    eas::{self},
    eth_address::EthAddress,
    evm::rpc::{eth_fee_history, eth_get_block_by_number},
    recipe::Recipe,
};
use anyhow::{anyhow, bail, Result};
use candid::Nat;

pub fn vec_to_run_id(bytes: Vec<u8>) -> Result<[u8; 12], String> {
    if bytes.len() == 12 {
        let mut array = [0u8; 12];
        array.copy_from_slice(&bytes[0..12]);
        Ok(array)
    } else {
        Err("Vector should have 12 elements".to_string())
    }
}

pub struct FeeEstimates {
    pub base_fee_per_gas: Nat,
    pub max_priority_fee_per_gas: Nat,
}

fn median_index(length: usize) -> usize {
    if length == 0 {
        panic!("Cannot find a median index for an array of length zero.");
    }
    (length - 1) / 2
}

pub async fn estimate_transaction_fees(run: &Run) -> Result<FeeEstimates> {
    let chain_config = chain_config::get(run.chain_id)?;

    let latest_block = eth_get_block_by_number(BlockTag::Latest, &chain_config).await?;

    let block_count = 9_u8;

    // we are setting the `max_priority_fee_per_gas` based on this article:
    // https://docs.alchemy.com/docs/maxpriorityfeepergas-vs-maxfeepergas
    // following this logic, the base fee will be derived from the block history automatically
    // and we only specify the maximum priority fee per gas (tip).
    // the tip is derived from the fee history of the last 9 blocks, more specifically
    // from the 95th percentile of the tip.
    let fee_history = eth_fee_history(
        &Nat::from(block_count),
        &BlockTag::Number(latest_block.number),
        Some(vec![95]),
        &chain_config,
    )
    .await?;

    // baseFeePerGas
    let base_fee_per_gas = fee_history.baseFeePerGas.last().unwrap().clone();

    // obtain the 95th percentile of the priority fees for the past 9 blocks
    let mut priority_fees_per_gas: Vec<Nat> = fee_history
        .reward
        .into_iter()
        .flat_map(|x| x.into_iter())
        .collect();

    // sort the tips in ascending order
    priority_fees_per_gas.sort_unstable();

    let median_index = median_index(block_count.into());

    // get the median by accessing the element in the middle set priority
    // fee to 0 if there are not enough blocks in case of a local testnet
    let median_priority_fee_per_gas = priority_fees_per_gas
        .get(median_index)
        .unwrap_or(&Nat::from(0_u8))
        .clone();

    Ok(FeeEstimates {
        base_fee_per_gas,
        max_priority_fee_per_gas: median_priority_fee_per_gas,
    })
}

pub async fn estimate_gas_usage(recipe: &Recipe, run: &Run) -> Result<Nat> {
    let recipient = EthAddress::from(run.creator.as_str());
    let mut query_response = Vec::new();

    for i in 0..recipe.queries.len() {
        let response = eas::run_query(&recipient, &recipe.queries[i]).await?;
        query_response.push(response);
    }

    let aggregated_response = format!("[{}]", query_response.join(","));

    let attestation_data = eas::process_query_result(&recipe.processor, &aggregated_response);

    let chain_config = chain_config::get(run.chain_id)?;

    let gas_usage =
        eas::estimate_attestation_gas_usage(recipe, &attestation_data, &recipient, &chain_config)
            .await?;

    let gas_usage = gas_usage
        .strip_prefix("0x")
        .ok_or(anyhow!("Gas usage should start with 0x".to_string()))?;

    let gas_usage = u64::from_str_radix(gas_usage, 16)
        .map_err(|err| anyhow!(format!("Error decoding gas usage: {}", err)))?;

    // Add 20% to the gas usage to account for any discrepancies
    let gas_usage = gas_usage + (gas_usage / 5);

    Ok(Nat::from(gas_usage))
}

pub fn get_min_user_fee_for_chain(chain_id: u32) -> Result<Nat> {
    let fee: u64 = match chain_id {
        11155111 => 500000000000000, // Sepolia, 0.0005 ETH
        10 => 50000000000000,        // Optimism, 0.00005 ETH
        _ => bail!("Chain not supported"),
    };
    Ok(Nat::from(fee))
}
