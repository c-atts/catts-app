use crate::{
    http_error::HttpError,
    run::{self, Run},
    user::auth_guard,
};
use ic_cdk::update;

#[update]
async fn run_list_for_user() -> Result<Vec<Run>, HttpError> {
    let address = auth_guard()?;

    Ok(run::get_by_address(&address.as_byte_array()))
}
