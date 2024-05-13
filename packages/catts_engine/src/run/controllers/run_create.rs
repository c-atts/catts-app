use crate::{
    chain_config::ChainConfig,
    error::Error,
    evm_rpc::{max_fee_per_gas, update_base_fee},
    logger::info,
    recipe::{Recipe, RecipeId},
    run::run_service::Run,
    siwe::get_authenticated_eth_address,
};
use ic_cdk::{api::canister_balance, update};

#[update]
async fn run_create(recipe_id: RecipeId, chain_id: u64) -> Result<Run, Error> {
    let cycles_before = canister_balance();
    let address = get_authenticated_eth_address().await?;

    let recipe = Recipe::get_by_id(&recipe_id).ok_or(Error::not_found("Recipe not found"))?;

    let chain_config = ChainConfig::get(chain_id).ok_or(Error::internal_server_error(
        "Chain config could not be loaded",
    ))?;
    let chain_config = update_base_fee(&chain_config)
        .await
        .map_err(|e| Error::internal_server_error(e))?;

    let evm_calls_usd = 0.25_f64;
    let evm_calls_gwei = evm_calls_usd / chain_config.eth_usd_price * 10e9_f64;

    ic_cdk::println!("evm_calls_gwei: {:?}", evm_calls_gwei);

    let fee = recipe.gas * max_fee_per_gas(&chain_config) + evm_calls_gwei as u64;

    ic_cdk::println!("fee: {:?}", fee);
    ChainConfig::set(chain_config);

    let run = Run::new(&recipe_id, chain_id, fee, &address).map_err(Error::bad_request)?;

    let cycles_after = canister_balance();
    info(
        format!(
            "run_create, cycles spent: {:?}",
            cycles_before - cycles_after
        )
        .as_str(),
    );

    Ok(run)
}
