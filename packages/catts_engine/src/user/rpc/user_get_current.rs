use ic_cdk::query;

use crate::{
    error::Error,
    user::{self, User},
};

#[query]
async fn user_get() -> Result<User, Error> {
    let caller = ic_cdk::api::caller();
    user::get_by_principal(caller).ok_or_else(|| Error::not_found("User not found"))
}
