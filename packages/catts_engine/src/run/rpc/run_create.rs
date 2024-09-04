use crate::{
    chain_config::{self},
    http_error::HttpError,
    logger::{self},
    recipe::{self, RecipeId, RecipePublishState},
    run::{self, get_cyclesfee_for_chain, get_min_gasfee_for_chain, Run},
    user::auth_guard,
};
use candid::Nat;
use ic_cdk::{api::canister_balance, update};

#[update]
async fn run_create(
    recipe_id: RecipeId,
    chain_id: u32,
    base_fee_per_gas: Nat,
    max_priority_fee_per_gas: Nat,
    gas: Nat,
) -> Result<Run, HttpError> {
    let address = auth_guard()?;

    let cycles_before = canister_balance();
    logger::debug("run_create");

    let recipe = recipe::get_by_id(&recipe_id).map_err(HttpError::not_found)?;

    if recipe.publish_state != RecipePublishState::Published {
        return Err(HttpError::bad_request("Recipe is not published"));
    }

    chain_config::get(chain_id).map_err(|_| {
        HttpError::internal_server_error(format!("Chain {} is not supported", chain_id).as_str())
    })?;

    let mut run = Run::new(&recipe_id, chain_id, &address).map_err(HttpError::bad_request)?;

    let gas_fee = gas.clone() * (base_fee_per_gas.clone() + max_priority_fee_per_gas.clone());
    let min_gas_fee = get_min_gasfee_for_chain(chain_id).unwrap();
    let gas_fee = gas_fee.max(min_gas_fee);

    let cycles_fee = get_cyclesfee_for_chain(chain_id).unwrap();

    let user_fee = gas_fee + cycles_fee;

    logger::debug(
        format!(
            "base_fee_per_gas: {}, max_priority_fee_per_gas: {}, gas: {}",
            base_fee_per_gas, max_priority_fee_per_gas, gas
        )
        .as_str(),
    );

    run.gas = Some(gas);
    run.base_fee_per_gas = Some(base_fee_per_gas);
    run.max_priority_fee_per_gas = Some(max_priority_fee_per_gas);
    run.user_fee = Some(user_fee);

    let run = run::create(run);

    let cycles_after = canister_balance();

    logger::info(
        format!(
            "run_create, cycles spent: {:?}",
            cycles_before - cycles_after
        )
        .as_str(),
    );

    Ok(run)
}
