use ic_cdk::update;

use crate::{
    error::Error,
    siwe::get_authenticated_eth_address,
    user::{self, User},
};

#[update]
async fn user_create() -> Result<User, Error> {
    let address = get_authenticated_eth_address().await?;
    let caller = ic_cdk::api::caller();
    user::create(caller, &address).map_err(Error::conflict)
}
