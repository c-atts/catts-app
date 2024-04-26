use serde_bytes::ByteBuf;

use crate::{
    declarations::ic_siwe_provider::{ic_siwe_provider, GetAddressResponse},
    error::Error,
    eth::EthAddress,
};

pub async fn get_caller_eth_address() -> Result<EthAddress, Error> {
    let response = ic_siwe_provider
        .get_address(ByteBuf::from(ic_cdk::caller().as_slice()))
        .await
        .map_err(|e| Error::internal_server_error(format!("Code: {:?}, message: {}", e.0, e.1)))?;

    let address = match response.0 {
        GetAddressResponse::Ok(address) => address,
        GetAddressResponse::Err(e) => return Err(Error::bad_request(e)),
    };

    let address = EthAddress::new(&address).map_err(Error::internal_server_error)?;

    Ok(address)
}
