use ic_cdk::query;

use crate::{
    http_error::HttpError,
    user::{self, User},
};

#[query]
async fn user_get() -> Result<User, HttpError> {
    let caller = ic_cdk::api::caller();
    user::get_by_principal(caller).map_err(HttpError::not_found)
}
