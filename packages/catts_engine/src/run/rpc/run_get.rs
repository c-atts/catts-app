use crate::{
    http_error::HttpError,
    run::{self, Run, RunId},
};
use ic_cdk::query;

#[query]
async fn run_get(run_id: RunId) -> Result<Run, HttpError> {
    run::get(&run_id).map_err(HttpError::not_found)
}
