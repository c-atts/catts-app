use crate::{
    http_error::HttpError,
    run::{self, Run, RunId},
};
use ic_cdk::query;

#[query]
async fn run_get(run_id: RunId) -> Result<Run, HttpError> {
    match run::get_by_id(&run_id) {
        Some(run) => Ok(run),
        None => Err(HttpError::not_found("Run not found")),
    }
}
