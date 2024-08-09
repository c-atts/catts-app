use std::fmt::Display;

use ethers_core::utils::hex;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum EthError {
    #[error("Address format error: {0}")]
    AddressFormatError(String),
    #[error("Decoding error: {0}")]
    DecodingError(#[from] hex::FromHexError),
}

pub type EthAddressBytes = [u8; 20];

/// Represents an Ethereum address with validation.
///
/// This struct ensures that the contained Ethereum address string is valid according to Ethereum standards.
/// It checks for correct length, hex encoding, and EIP-55 encoding.
#[derive(Debug)]
pub struct EthAddress(String);

impl EthAddress {
    /// Creates a new `EthAddress` after validating the Ethereum address format and encoding.
    ///
    /// The address must start with '0x', be 42 characters long, and comply with EIP-55 encoding.
    ///
    /// # Arguments
    /// * `address` - A string slice representing the Ethereum address.
    pub fn new(address: &str) -> Result<EthAddress, EthError> {
        if !address.starts_with("0x") || address.len() != 42 {
            return Err(EthError::AddressFormatError(String::from(
                "Must start with '0x' and be 42 characters long",
            )));
        }

        hex::decode(&address[2..]).map_err(EthError::DecodingError)?;

        Ok(EthAddress(address.to_lowercase().to_owned()))
    }

    /// Returns a string slice of the Ethereum address.
    pub fn as_str(&self) -> &str {
        &self.0
    }

    /// Converts the Ethereum address into a byte vector.
    pub fn _as_bytes(&self) -> Vec<u8> {
        let address = self.0.strip_prefix("0x").unwrap();
        hex::decode(address).unwrap()
    }

    /// Converts the Ethereum address into a byte array.
    pub fn as_byte_array(&self) -> [u8; 20] {
        let address = self.0.strip_prefix("0x").unwrap();
        let bytes = hex::decode(address).unwrap();
        let mut array = [0; 20];
        array.copy_from_slice(&bytes);
        array
    }
}

impl Display for EthAddress {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl From<[u8; 20]> for EthAddress {
    fn from(address_bytes: [u8; 20]) -> Self {
        let hex_str = hex::encode(address_bytes);
        let eth_address_str = format!("0x{}", hex_str);
        EthAddress::new(&eth_address_str).expect("Valid length and hex encoding")
    }
}

impl From<&str> for EthAddress {
    fn from(address: &str) -> Self {
        EthAddress::new(address).expect("Valid length and hex encoding")
    }
}

impl TryFrom<Vec<u8>> for EthAddress {
    type Error = EthError;

    fn try_from(value: Vec<u8>) -> Result<Self, Self::Error> {
        if value.len() != 20 {
            return Err(EthError::AddressFormatError(
                "Must be 20 bytes long".to_string(),
            ));
        }
        let address_array: [u8; 20] = value.try_into().expect("Checked length to be 20");
        Ok(EthAddress::from(address_array))
    }
}

pub fn remove_address_padding(padded_address: &str) -> String {
    if padded_address.starts_with("0x") && padded_address.len() >= 42 {
        let start_index = padded_address.len() - 40;
        format!("0x{}", &padded_address[start_index..])
    } else {
        padded_address.to_string()
    }
}

#[macro_export]
macro_rules! include_abi {
    ($file:expr $(,)?) => {{
        match serde_json::from_str::<ethers_core::abi::Contract>(include_str!($file)) {
            Ok(contract) => contract,
            Err(err) => panic!("Error loading ABI contract {:?}: {}", $file, err),
        }
    }};
}
