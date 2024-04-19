use ic_cdk::update;

use crate::{authenticated, eas::Uid, eth::EthAddress, run::Run, siwe::get_address};

#[update(guard = authenticated)]
async fn init_run(recipe_uid: Uid) -> Result<Run, String> {
    let cycles_before = ic_cdk::api::canister_balance();

    let address = get_address().await?;
    let address = EthAddress::new(&address)?;

    let active_runs = Run::get_active(&address.as_byte_array());
    if !active_runs.is_empty() {
        return Err(String::from("You already have an active run"));
    }

    // Fixed price for now, will be replaced with dynamic pricing
    let run = Run::new(&address, 10000000000000, &recipe_uid);

    Run::create(run.clone());

    let cycles_after = ic_cdk::api::canister_balance();
    ic_cdk::println!(
        "Function: init_run, Cycles spent: {:?}",
        cycles_before - cycles_after
    );

    Ok(run)
}
