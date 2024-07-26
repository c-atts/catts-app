use candid::Principal;
use ic_cdk::query;
use serde_bytes::ByteBuf;

use crate::{
    http_error::HttpError,
    user::{self, User},
};

#[query]
async fn user_get_by_principal(principal_bytes: ByteBuf) -> Result<User, HttpError> {
    if principal_bytes.len() != 29 {
        return Err(HttpError::bad_request("Principal must be 29 bytes"));
    }
    let principal = Principal::from_slice(principal_bytes.as_ref());
    user::get_by_principal(principal).map_err(HttpError::not_found)
}
