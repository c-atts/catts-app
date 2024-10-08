use ic_cdk::query;

use crate::{
    eth_address::EthAddress,
    http_error::HttpError,
    user::{self, User},
};

#[query]
async fn user_get_by_eth_address(address: String) -> Result<User, HttpError> {
    let address = EthAddress::new(&address).map_err(|e| HttpError::bad_request(e.to_string()))?;
    user::get_by_eth_address(&address).map_err(HttpError::not_found)
}
