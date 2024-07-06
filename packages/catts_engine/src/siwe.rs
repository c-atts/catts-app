use candid::Principal;
use serde_bytes::ByteBuf;

use crate::{
    declarations::ic_siwe_provider::{GetAddressResponse, IcSiweProvider},
    error::Error,
    eth::EthAddress,
    SIWE_PROVIDER_CANISTER_ID,
};

pub async fn get_authenticated_eth_address() -> Result<EthAddress, Error> {
    let caller = ic_cdk::api::caller();
    if caller == Principal::anonymous() {
        return Err(Error::unauthorized(
            "Anonymous caller is not allowed to call this method.",
        ));
    }

    let maybe_id = SIWE_PROVIDER_CANISTER_ID.with_borrow(|maybe_id| *maybe_id);
    let response = match maybe_id {
        Some(siwe_provider_canister_id) => {
            let response = IcSiweProvider(siwe_provider_canister_id)
                .get_address(ByteBuf::from(caller.as_slice()))
                .await
                .map_err(|e| {
                    Error::internal_server_error(format!("Code: {:?}, message: {}", e.0, e.1))
                })?;

            Ok(response)
        }
        None => Err(Error::internal_server_error(
            "SIWE provider canister ID is not set.",
        )),
    }?;

    let address = match response.0 {
        GetAddressResponse::Ok(address) => address,
        GetAddressResponse::Err(e) => return Err(Error::unauthorized(e)),
    };

    let address = EthAddress::new(&address).map_err(Error::internal_server_error)?;

    Ok(address)
}
