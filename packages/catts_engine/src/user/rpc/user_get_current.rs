use ic_cdk::query;

use crate::{
    http_error::HttpError,
    user::{self, User},
};

#[query]
async fn user_get() -> Result<User, HttpError> {
    let caller = ic_cdk::api::caller();
    user::get_by_principal(caller).ok_or_else(|| HttpError::not_found("User not found"))
}
