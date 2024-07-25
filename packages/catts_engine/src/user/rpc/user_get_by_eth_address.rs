use ic_cdk::query;

use crate::{
    eth::EthAddress,
    http_error::HttpError,
    user::{self, User},
};

#[query]
async fn user_get_by_eth_address(address: String) -> Result<User, HttpError> {
    let address = EthAddress::new(&address).map_err(|e| HttpError::bad_request(e.to_string()))?;
    user::get_by_eth_address(&address).ok_or_else(|| HttpError::not_found("User not found"))
}
