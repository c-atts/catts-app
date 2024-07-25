use ic_cdk::update;

use crate::{
    http_error::HttpError,
    siwe::{get_authenticated_eth_address, GetAuthenticatedEthAddressError},
    user::{self, User},
};

#[update]
async fn user_create() -> Result<User, HttpError> {
    let address = match get_authenticated_eth_address().await {
        Ok(Some(address)) => address,
        Ok(None) => return Err(HttpError::unauthorized("Login with SIWE canister first")),
        Err(e) => match e {
            GetAuthenticatedEthAddressError::AnonymousCaller => {
                return Err(HttpError::unauthorized(e))
            }
            _ => return Err(HttpError::internal_server_error(e)),
        },
    };
    let caller = ic_cdk::api::caller();
    user::create(caller, &address).map_err(HttpError::conflict)
}
