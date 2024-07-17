use candid::Principal;
use ic_cdk::query;
use serde_bytes::ByteBuf;

use crate::{
    error::Error,
    user::{self, User},
};

#[query]
async fn user_get_by_principal(principal_bytes: ByteBuf) -> Result<User, Error> {
    if principal_bytes.len() != 29 {
        return Err(Error::bad_request("Principal must be 29 bytes"));
    }
    let principal = Principal::from_slice(principal_bytes.as_ref());
    user::get_by_principal(principal).ok_or_else(|| Error::not_found("User not found"))
}
