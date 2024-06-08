use crate::{error::Error, logger::info, run::run::Run, siwe::get_authenticated_eth_address};
use ic_cdk::{api::canister_balance, update};

#[update]
async fn run_list_for_user() -> Result<Vec<Run>, Error> {
    let cycles_before = canister_balance();
    let address = get_authenticated_eth_address().await?;

    let runs = Run::get_by_address(&address.as_byte_array());

    let cycles_after = canister_balance();
    info(
        format!(
            "run_list_for_user, cycles spent: {:?}",
            cycles_before - cycles_after
        )
        .as_str(),
    );

    Ok(runs)
}
