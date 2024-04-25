use ic_cdk::update;

use crate::{authenticated, eth::EthAddress, run::Run, siwe::get_address};

#[update(guard = authenticated)]
async fn init_run(recipe_id: String) -> Result<Run, String> {
    let cycles_before = ic_cdk::api::canister_balance();

    let address = get_address().await?;
    let address = EthAddress::new(&address)?;

    // Fixed price for now, will be replaced with dynamic pricing
    let run = Run::new(&address, 10000000000000, &recipe_id)?;

    let cycles_after = ic_cdk::api::canister_balance();
    ic_cdk::println!(
        "Function: init_run, Cycles spent: {:?}",
        cycles_before - cycles_after
    );

    Ok(run)
}
