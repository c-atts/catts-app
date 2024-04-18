use ethers_core::abi::{encode, encode_packed, Address, Token};
use ethers_core::types::U256;
use ethers_core::utils::keccak256;
use serde::{Deserialize, Serialize};
use std::str::FromStr;
use tiny_keccak::{Hasher, Keccak};

pub type Uid = String;

#[derive(Serialize, Deserialize, Debug)]
struct AbiValue {
    name: String,
    #[serde(rename = "type")]
    type_: String,
    value: ValueField,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(untagged)]
enum ValueField {
    BigNumber {
        #[serde(rename = "type")]
        type_: String,
        hex: String,
    },
    Number(u64),
}

pub fn encode_abi_data(json_data: &str) -> Vec<u8> {
    // Parse the JSON string into structs
    let abi_values: Vec<AbiValue> = serde_json::from_str(json_data).expect("Failed to parse JSON");

    let tokens: Vec<Token> = abi_values
        .iter()
        .map(|item| match item.type_.as_str() {
            _ if item.type_.starts_with("uint") => match &item.value {
                ValueField::BigNumber { hex, .. } => {
                    Token::Uint(U256::from_str(hex).expect("Invalid hex value"))
                }
                ValueField::Number(num) => Token::Uint((*num).into()),
            },
            _ if item.type_.starts_with("int") => match &item.value {
                ValueField::BigNumber { hex, .. } => {
                    Token::Int(U256::from_str(hex).expect("Invalid hex value"))
                }
                ValueField::Number(num) => Token::Int((*num).into()),
            },
            _ => panic!("Unsupported type: {}", item.type_),
        })
        .collect();

    // Convert parsed values into tokens
    // let tokens: Vec<Token> = abi_values
    //     .iter()
    //     .map(|item| match item.type_.as_str() {
    //         "uint256" | "uint" => match &item.value {
    //             ValueField::BigNumber { hex, .. } => {
    //                 Token::Uint(U256::from_str(hex).expect("Invalid hex value"))
    //             }
    //             ValueField::Number(num) => Token::Uint((*num).into()),
    //         },
    //         "uint32" => match &item.value {
    //             ValueField::Number(num) => Token::Uint((*num as u32).into()),
    //             _ => panic!("Invalid value type for uint32"),
    //         },
    //         "uint8" => match &item.value {
    //             ValueField::Number(num) => Token::Uint((*num as u8).into()),
    //             _ => panic!("Invalid value type for uint8"),
    //         },
    //         _ => panic!("Unsupported type: {}", item.type_),
    //     })
    //     .collect();

    // Encode the tokens
    encode(&tokens)
}

pub fn get_schema_uid(
    schema: &str,
    resolver_address: &str,
    revokable: bool,
) -> Result<[u8; 32], String> {
    let schema_token = Token::String(schema.to_string());
    let resolver_address: Address = resolver_address
        .parse::<Address>()
        .map_err(|e| e.to_string())?;
    let resolver_address_token = Token::Address(resolver_address);
    let revocable_token = Token::Bool(revokable);
    let encoded = encode_packed(&[schema_token, resolver_address_token, revocable_token])
        .map_err(|e| e.to_string())?;
    Ok(keccak256(&encoded))
    // let keccak256_output = keccak256(encoded);
    // Ok(format!("0x{}", hex::encode(keccak256_output)))
}
