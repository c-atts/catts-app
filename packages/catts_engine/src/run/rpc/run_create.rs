use crate::{
    chain_config::{self},
    http_error::HttpError,
    logger,
    recipe::{self, RecipeId},
    run::{self, estimate_gas_usage, get_user_fee_for_chain, util::estimate_transaction_fees, Run},
    user::auth_guard,
};
use ic_cdk::{api::canister_balance, update};

#[update]
async fn run_create(recipe_id: RecipeId, chain_id: u64) -> Result<Run, HttpError> {
    let cycles_before = canister_balance();
    let address = auth_guard()?;
    let recipe = recipe::get_by_id(&recipe_id).map_err(HttpError::not_found)?;

    chain_config::get(chain_id).map_err(|_| {
        HttpError::internal_server_error(format!("Chain {} is not supported", chain_id).as_str())
    })?;

    let mut run = Run::new(&recipe_id, chain_id, &address).map_err(HttpError::bad_request)?;

    let fee_estimates = estimate_transaction_fees(&run)
        .await
        .map_err(HttpError::internal_server_error)?;

    let gas = estimate_gas_usage(&recipe, &run)
        .await
        .map_err(HttpError::internal_server_error)?;

    let user_fee = get_user_fee_for_chain(chain_id).map_err(HttpError::internal_server_error)?;

    ic_cdk::println!(
        "base_fee_per_gas: {}, max_priority_fee_per_gas: {}, gas: {}",
        fee_estimates.base_fee_per_gas,
        fee_estimates.max_priority_fee_per_gas,
        gas
    );

    run.gas = Some(gas);
    run.base_fee_per_gas = Some(fee_estimates.base_fee_per_gas);
    run.max_priority_fee_per_gas = Some(fee_estimates.max_priority_fee_per_gas);
    run.user_fee = Some(user_fee);

    let run = run::save(run);

    let cycles_after = canister_balance();
    logger::info(
        format!(
            "run_register_payment, cycles spent: {:?}",
            cycles_before - cycles_after
        )
        .as_str(),
    );

    Ok(run)
}
