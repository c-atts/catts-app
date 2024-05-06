use crate::{
    error::Error, logger::info, recipe::RecipeId, run::run_service::Run,
    siwe::get_authenticated_eth_address,
};
use ic_cdk::{api::canister_balance, update};

#[update]
async fn run_create(recipe_id: RecipeId) -> Result<Run, Error> {
    let cycles_before = canister_balance();
    let address = get_authenticated_eth_address().await?;

    // Fixed price for now, will be replaced with dynamic pricing
    let run = Run::new(&address, 100000000000, &recipe_id).map_err(Error::bad_request)?;

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
