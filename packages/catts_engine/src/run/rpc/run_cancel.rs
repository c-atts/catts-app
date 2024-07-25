use crate::{
    http_error::HttpError,
    logger::info,
    run::{self, Run, RunError, RunId},
    user::auth_guard,
};
use ic_cdk::{api::canister_balance, update};

#[update]
async fn run_cancel(run_id: RunId) -> Result<Run, HttpError> {
    let cycles_before = canister_balance();
    let address = auth_guard()?;

    let run = run::get(&address, &run_id).map_err(HttpError::not_found)?;

    // Only creator can cancel the run
    if run.creator != address.as_byte_array() {
        return Err(HttpError::forbidden("Only creator can cancel the run"));
    }

    let run = run::cancel(&address, &run_id).map_err(|err| match err {
        RunError::CantBeCancelled(msg) => HttpError::bad_request(msg),
        RunError::NotFound => HttpError::not_found(err),
        RunError::RecipeNotFound => HttpError::not_found(err),
    })?;

    let cycles_after = canister_balance();
    info(
        format!(
            "run_cancel, cycles spent: {:?}",
            cycles_before - cycles_after
        )
        .as_str(),
    );

    Ok(run)
}
