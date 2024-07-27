use crate::{
    http_error::HttpError,
    run::{self, Run, RunError, RunId},
    user::auth_guard,
};
use ic_cdk::update;

#[update]
async fn run_cancel(run_id: RunId) -> Result<Run, HttpError> {
    let address = auth_guard()?;

    let run = run::get(&address, &run_id).map_err(HttpError::not_found)?;

    // Only creator can cancel the run
    if run.creator != address.as_byte_array() {
        return Err(HttpError::forbidden("Only creator can cancel the run"));
    }

    let run = run::cancel(&address, &run_id).map_err(|err| match err {
        RunError::CantBeCancelled(msg) => HttpError::bad_request(msg),
        err => HttpError::internal_server_error(err),
    })?;

    Ok(run)
}
