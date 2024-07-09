use ic_cdk::update;

use crate::{
    error::Error,
    siwe::{get_authenticated_eth_address, GetAuthenticatedEthAddressError},
    user::{self, User},
};

#[update]
async fn user_create() -> Result<User, Error> {
    let address = match get_authenticated_eth_address().await {
        Ok(Some(address)) => address,
        Ok(None) => return Err(Error::unauthorized("Login with SIWE canister first")),
        Err(e) => match e {
            GetAuthenticatedEthAddressError::AnonymousCaller => return Err(Error::unauthorized(e)),
            _ => return Err(Error::internal_server_error(e)),
        },
    };
    let caller = ic_cdk::api::caller();
    user::create(caller, &address).map_err(Error::conflict)
}
