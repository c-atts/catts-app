use ic_cdk::query;

use crate::{
    error::Error,
    eth::EthAddress,
    user::{self, User},
};

#[query]
async fn user_get_by_eth_address(address: String) -> Result<User, Error> {
    let address = EthAddress::new(&address).map_err(|e| Error::bad_request(e.to_string()))?;
    user::get_by_eth_address(&address).ok_or_else(|| Error::not_found("User not found"))
}
