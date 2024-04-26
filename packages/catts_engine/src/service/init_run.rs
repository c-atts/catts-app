use ic_cdk::update;

use crate::error::Error;
use crate::recipe::RecipeId;
use crate::{authenticated, run::Run, siwe::get_caller_eth_address};

#[update(guard = authenticated)]
async fn init_run(recipe_id: RecipeId) -> Result<Run, Error> {
    let cycles_before = ic_cdk::api::canister_balance();

    let address = get_caller_eth_address().await?;

    // Fixed price for now, will be replaced with dynamic pricing
    let run = Run::new(&address, 1000000000000, &recipe_id).map_err(Error::bad_request)?;

    let cycles_after = ic_cdk::api::canister_balance();
    ic_cdk::println!(
        "Function: init_run, Cycles spent: {:?}",
        cycles_before - cycles_after
    );

    Ok(run)
}
