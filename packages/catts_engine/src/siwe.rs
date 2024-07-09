use candid::Principal;
use serde_bytes::ByteBuf;
use thiserror::Error;

use crate::{
    declarations::ic_siwe_provider::{GetAddressResponse, IcSiweProvider},
    eth::EthAddress,
    CANISTER_SETTINGS,
};

#[derive(Error, Debug)]
pub enum GetAuthenticatedEthAddressError {
    #[error("Anonymous caller is not allowed to call this method.")]
    AnonymousCaller,
    #[error("Invalid SIWE provider canister ID.")]
    InvalidSiweProviderCanisterId,
    #[error("SIWE canister returned an error: {0}")]
    SiweCanisterError(String),
    #[error("SIWE canister returned an invalid address.")]
    InvalidAddress,
}

pub async fn get_authenticated_eth_address(
) -> Result<Option<EthAddress>, GetAuthenticatedEthAddressError> {
    let caller = ic_cdk::api::caller();
    if caller == Principal::anonymous() {
        return Err(GetAuthenticatedEthAddressError::AnonymousCaller);
    }

    let siwe_provider_canister = Principal::from_text(
        CANISTER_SETTINGS.with(|gs| gs.borrow().siwe_provider_canister.clone()),
    )
    .map_err(|_| GetAuthenticatedEthAddressError::InvalidSiweProviderCanisterId)?;

    let response = IcSiweProvider(siwe_provider_canister)
        .get_address(ByteBuf::from(caller.as_slice()))
        .await
        .map_err(|e| {
            GetAuthenticatedEthAddressError::SiweCanisterError(format!(
                "Code: {:?}, message: {}",
                e.0, e.1
            ))
        })?;

    match response.0 {
        GetAddressResponse::Ok(address) => {
            Ok(Some(EthAddress::new(&address).map_err(|_| {
                GetAuthenticatedEthAddressError::InvalidAddress
            })?))
        }
        GetAddressResponse::Err(_) => Ok(None),
    }
}
