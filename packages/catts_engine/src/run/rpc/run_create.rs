use crate::{
    chain_config::{self},
    http_error::HttpError,
    logger,
    recipe::{self, RecipeId, RecipePublishState},
    run::{
        self, estimate_gas_usage, get_cyclesfee_for_chain, get_min_gasfee_for_chain,
        util::estimate_transaction_fees, Run,
    },
    user::auth_guard,
};
use candid::Nat;
use ic_cdk::{api::canister_balance, update};

#[update]
async fn run_create(recipe_id: RecipeId, chain_id: u32) -> Result<Run, HttpError> {
    let cycles_before = canister_balance();
    let address = auth_guard()?;
    let recipe = recipe::get_by_id(&recipe_id).map_err(HttpError::not_found)?;

    if recipe.publish_state != RecipePublishState::Published {
        return Err(HttpError::bad_request("Recipe is not published"));
    }

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

    let user_fee = gas.clone()
        * (fee_estimates.base_fee_per_gas.clone() + fee_estimates.max_priority_fee_per_gas.clone());

    let min_gas_fee =
        get_min_gasfee_for_chain(chain_id).map_err(HttpError::internal_server_error)?;

    let user_fee = user_fee.max(min_gas_fee);

    let cycles_fee = get_cyclesfee_for_chain(chain_id).map_err(HttpError::internal_server_error)?;

    let user_fee = user_fee + cycles_fee;

    // Add 2% of the base fee to the max priority fee per gas
    let max_priority_fee_per_gas = fee_estimates.max_priority_fee_per_gas.clone()
        + (fee_estimates.base_fee_per_gas.clone() * Nat::from(2u32) / Nat::from(100u32));

    ic_cdk::println!(
        "base_fee_per_gas: {}, max_priority_fee_per_gas: {}, gas: {}",
        fee_estimates.base_fee_per_gas,
        max_priority_fee_per_gas,
        gas
    );

    run.gas = Some(gas);
    run.base_fee_per_gas = Some(fee_estimates.base_fee_per_gas);
    run.max_priority_fee_per_gas = Some(max_priority_fee_per_gas);
    run.user_fee = Some(user_fee);

    let run = run::create(run);

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
