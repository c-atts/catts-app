use std::fmt;

#[derive(Debug)]
pub enum EthError {
    AddressFormatError(String),
    DecodingError(hex::FromHexError),
    SignatureFormatError(String),
    InvalidSignature,
    InvalidRecoveryId,
    PublicKeyRecoveryFailure,
    Eip55Error(String),
}

impl From<hex::FromHexError> for EthError {
    fn from(err: hex::FromHexError) -> Self {
        EthError::DecodingError(err)
    }
}

impl fmt::Display for EthError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            EthError::AddressFormatError(e) => write!(f, "Address format error: {}", e),
            EthError::DecodingError(e) => write!(f, "Decoding error: {}", e),
            EthError::SignatureFormatError(e) => write!(f, "Signature format error: {}", e),
            EthError::InvalidSignature => write!(f, "Invalid signature"),
            EthError::InvalidRecoveryId => write!(f, "Invalid recovery ID"),
            EthError::PublicKeyRecoveryFailure => {
                write!(f, "Public key recovery failure")
            }
            EthError::Eip55Error(e) => write!(f, "EIP-55 error: {}", e),
        }
    }
}

impl From<EthError> for String {
    fn from(error: EthError) -> Self {
        error.to_string()
    }
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

        Ok(EthAddress(address.to_owned()))
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

#[cfg(test)]
mod eth_address {
    use crate::eth::EthAddress;

    #[test]
    fn test_eth_address_invalid_address() {
        let invalid_address = "0xG".to_owned() + &"1".repeat(39); // A mock invalid Ethereum address
        let result = EthAddress::new(invalid_address.as_str());
        assert!(result.is_err());
        let err_msg: String = result.unwrap_err().into();
        assert_eq!(
            err_msg,
            "Decoding error: Invalid character 'G' at position 0"
        );
    }

    #[test]
    fn test_eth_address_invalid_hex_encoding() {
        let invalid_address = "0x".to_owned() + &"G".repeat(40); // Invalid hex
        let result = EthAddress::new(invalid_address.as_str());
        assert!(result.is_err());
        let err_msg: String = result.unwrap_err().into();
        assert_eq!(
            err_msg,
            "Decoding error: Invalid character 'G' at position 0"
        );
    }

    #[test]
    fn test_eth_address_too_short() {
        let invalid_address = "0x".to_owned() + &"1".repeat(39); // Too short
        let result = EthAddress::new(invalid_address.as_str());
        assert!(result.is_err());
        let err_msg: String = result.unwrap_err().into();
        assert_eq!(
            err_msg,
            "Address format error: Must start with '0x' and be 42 characters long"
        );
    }

    #[test]
    fn test_eth_address_too_long() {
        let invalid_address = "0x".to_owned() + &"1".repeat(41); // Too long
        let result = EthAddress::new(invalid_address.as_str());
        assert!(result.is_err());
        let err_msg: String = result.unwrap_err().into();
        assert_eq!(
            err_msg,
            "Address format error: Must start with '0x' and be 42 characters long"
        );
    }
    #[test]
    fn test_eth_address_invalid_eip55() {
        let invalid_address = "0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed";
        let result = EthAddress::new(invalid_address);
        assert!(result.is_err());
        let err_msg: String = result.unwrap_err().into();
        assert_eq!(err_msg, "EIP-55 error: Not EIP-55 encoded");
    }
}
