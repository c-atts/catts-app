use crate::{
    error::Error,
    logger::info,
    run::{self, Run},
    user::auth_guard,
};
use ic_cdk::{api::canister_balance, update};

#[update]
async fn run_list_for_user() -> Result<Vec<Run>, Error> {
    let cycles_before = canister_balance();
    let address = auth_guard()?;

    let runs = run::get_by_address(&address.as_byte_array());

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
