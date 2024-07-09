use crate::error::Error;
use crate::eth::EthAddress;
use crate::user;
use candid::Principal;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum GetPrincipalEthAddressError {
    #[error("Anonymous caller is not allowed to call this method.")]
    AnonymousCaller,
    #[error("User not found")]
    UserNotFound,
    #[error("Could not create user ETH address")]
    EthError,
}

pub fn get_caller_eth_address() -> Result<EthAddress, GetPrincipalEthAddressError> {
    let caller = ic_cdk::caller();
    if caller == Principal::anonymous() {
        return Err(GetPrincipalEthAddressError::AnonymousCaller);
    }

    let user = user::get_by_principal(caller);

    if let Some(user) = user {
        EthAddress::new(user.eth_address.as_str())
            .map_err(|_| GetPrincipalEthAddressError::EthError)
    } else {
        Err(GetPrincipalEthAddressError::UserNotFound)
    }
}

pub fn auth_guard() -> Result<EthAddress, Error> {
    get_caller_eth_address().map_err(Error::unauthorized)
}
