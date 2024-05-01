use crate::error::Error;
use crate::logger::info;
use crate::run::run_service::{Run, RunError, RunId};
use crate::siwe::get_authenticated_eth_address;
use ic_cdk::update;

#[update]
async fn run_cancel(run_id: RunId) -> Result<Run, Error> {
    let cycles_before = ic_cdk::api::canister_balance();
    let address = get_authenticated_eth_address().await?;

    let run = match Run::get(&address.as_byte_array(), &run_id) {
        Some(run) => run,
        None => return Err(Error::not_found(RunError::NotFound)),
    };

    // Only creator can cancel the run
    if run.creator != address.as_byte_array() {
        return Err(Error::forbidden("Only creator can cancel the run"));
    }

    let reusult = match Run::cancel(&address.as_byte_array(), &run_id) {
        Ok(run) => Ok(run),
        Err(err) => match err {
            RunError::AlreadyPaid => {
                Err(Error::bad_request("Already paid runs cannot be cancelled"))
            }
            RunError::NotFound => Err(Error::not_found(err)),
        },
    };

    let cycles_after = ic_cdk::api::canister_balance();
    info(
        format!(
            "run_cancel, cycles spent: {:?}",
            cycles_before - cycles_after
        )
        .as_str(),
    );

    reusult
}
