use crate::authenticated;
use crate::error::Error;
use crate::run::{Run, RunError, RunId};
use crate::siwe::get_caller_eth_address;
use ic_cdk::update;

#[update (guard = authenticated)]
async fn cancel_run(run_id: RunId) -> Result<Run, Error> {
    let address = get_caller_eth_address().await?;

    match Run::cancel(&address.as_byte_array(), &run_id) {
        Ok(run) => Ok(run),
        Err(e) => match e {
            RunError::AccessDenied => Err(Error::forbidden(e)),
            RunError::NotFound => Err(Error::not_found(e)),
            _ => Err(Error::internal_server_error("An unexpected error occurred")),
        },
    }
}
