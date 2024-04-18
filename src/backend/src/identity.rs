use serde_bytes::ByteBuf;

use crate::declarations::ic_siwe_provider::{ic_siwe_provider, GetAddressResponse};

pub async fn get_address() -> Result<String, String> {
    let response = ic_siwe_provider
        .get_address(ByteBuf::from(ic_cdk::caller().as_slice()))
        .await;

    let address = match response {
        Ok((inner_result,)) => {
            // Handle the inner Result (GetAddressResponse)
            match inner_result {
                GetAddressResponse::Ok(address) => address, // Successfully got the address
                GetAddressResponse::Err(e) => return Err(e), // Handle error in GetAddressResponse
            }
        }
        Err(_) => return Err("Failed to get the caller address".to_string()), // Handle ic_cdk::call error
    };

    // Return the calling principal and address
    Ok(address)
}
