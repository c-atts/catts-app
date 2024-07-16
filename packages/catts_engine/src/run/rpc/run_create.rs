use crate::{
    chain_config::{self},
    error::Error,
    evm_rpc::max_fee_per_gas,
    logger::info,
    recipe::{self, RecipeId},
    run::run::Run,
    user::auth_guard,
};
use ic_cdk::{api::canister_balance, update};

#[update]
async fn run_create(recipe_id: RecipeId, chain_id: u64) -> Result<Run, Error> {
    let cycles_before = canister_balance();
    let address = auth_guard()?;

    let recipe = recipe::get_by_id(&recipe_id).ok_or(Error::not_found("Recipe not found"))?;

    let chain_config = chain_config::get(chain_id).ok_or(Error::internal_server_error(
        "Chain config could not be loaded",
    ))?;

    let evm_calls_usd = 0.1_f64;
    let evm_calls_wei = evm_calls_usd / chain_config.eth_usd_price * 1e18_f64;

    let gas = recipe
        .gas
        .as_ref()
        .ok_or_else(|| Error::bad_request("Recipe don't have a gas amount specified"))?;

    let fee = gas.clone() * max_fee_per_gas(&chain_config) + evm_calls_wei as u64;

    chain_config::set(chain_config);

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
