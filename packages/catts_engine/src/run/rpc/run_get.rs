use crate::{
    error::Error,
    run::run::{Run, RunId},
};
use ic_cdk::query;

#[query]
async fn run_get(run_id: RunId) -> Result<Run, Error> {
    match Run::get_by_id(&run_id) {
        Some(run) => Ok(run),
        None => Err(Error::not_found("Run not found")),
    }
}
