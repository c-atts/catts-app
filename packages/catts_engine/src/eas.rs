use crate::{
    chain_config::{self, ChainConfig},
    eth_address::EthAddress,
    evm::rpc::{eth_estimate_gas, eth_transaction},
    graphql::insert_dynamic_variables,
    recipe::{Recipe, RecipeQuery},
    run::Run,
    ETH_DEFAULT_CALL_CYCLES, ETH_EAS_CONTRACT, THEGRAPH_QUERY_PROXY_URL,
};
use anyhow::{anyhow, Result};
use blake2::{
    digest::{Update, VariableOutput},
    Blake2bVar,
};
use ethers_core::{
    abi::{encode, encode_packed, ethereum_types::H160, Address, Token},
    types::U256,
    utils::keccak256,
};
use ic_cdk::api::{
    call::RejectionCode,
    management_canister::http_request::{
        http_request, CanisterHttpRequestArgument, HttpHeader, HttpMethod, TransformContext,
    },
};
use javy::Runtime;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::{collections::HashMap, str::FromStr, sync::Arc};
use thiserror::Error;

pub type Uid = String;

// Enum to represent possible types for SchemaValue
#[derive(Debug, Serialize, Deserialize)]
#[serde(untagged)]
pub enum SchemaValue {
    String(String),
    Bool(bool),
    Number(u64),    // f64 is used for number (includes integers and floats)
    BigInt(String), // BigInt can be represented as a string to handle large numbers
    Object(serde_json::Map<String, Value>),
    Array(Vec<Value>),
    Unknown(Value), // For unknown types
}

// Struct to represent the SchemaItem
#[derive(Debug, Serialize, Deserialize)]
pub struct SchemaItem {
    pub name: String,
    #[serde(rename = "type")]
    pub type_field: String, // Note: Use `type_field` because `type` is a reserved word in Rust
    pub value: SchemaValue,
}

pub fn encode_abi_data(json_data: &str) -> Vec<u8> {
    let schema_items: Vec<SchemaItem> =
        serde_json::from_str(json_data).expect("Failed to parse JSON");

    let tokens: Vec<Token> = schema_items
        .iter()
        .map(|item| match item.type_field.as_str() {
            _ if item.type_field == "address" => match &item.value {
                SchemaValue::String(hex) => {
                    Token::Address(Address::from_str(hex).expect("Invalid address"))
                }
                _ => panic!("Unsupported value: {:?}", item.value),
            },
            _ if item.type_field == "string" => match &item.value {
                SchemaValue::String(val) => Token::String(val.clone()),
                _ => panic!("Unsupported value: {:?}", item.value),
            },
            _ if item.type_field == "bool" => match &item.value {
                SchemaValue::Bool(val) => Token::Bool(*val),
                _ => panic!("Unsupported value: {:?}", item.value),
            },
            _ if item.type_field == "bytes" => match &item.value {
                SchemaValue::String(hex) => {
                    Token::Bytes(hex::decode(hex).expect("Invalid hex value"))
                }
                _ => panic!("Unsupported value: {:?}", item.value),
            },
            _ if item.type_field == "bytes32" => match &item.value {
                SchemaValue::String(hex) => {
                    Token::FixedBytes(hex::decode(hex).expect("Invalid hex value"))
                }
                _ => panic!("Unsupported value: {:?}", item.value),
            },
            _ if item.type_field.starts_with("uint") => match &item.value {
                SchemaValue::String(hex) => {
                    Token::Uint(U256::from_str(hex).expect("Invalid hex value"))
                }
                SchemaValue::Number(num) => Token::Uint({ *num }.into()),
                _ => panic!("Unsupported value: {:?}", item.value),
            },
            _ if item.type_field.starts_with("int") => match &item.value {
                SchemaValue::String(hex) => {
                    Token::Int(U256::from_str(hex).expect("Invalid hex value"))
                }
                SchemaValue::Number(num) => Token::Int({ *num }.into()),
                _ => panic!("Unsupported value: {:?}", item.value),
            },
            _ => panic!("Unsupported type: {}", item.type_field),
        })
        .collect();

    // Encode the tokens
    encode(&tokens)
}

#[derive(Error, Debug)]
pub enum GetSchemaUidError {
    #[error("Address parse error: {0}")]
    AddressParseError(String),

    #[error("Failed to encode ABI data: {0}")]
    EncodePackedError(#[from] ethers_core::abi::EncodePackedError),
}

pub fn get_schema_uid(
    schema: &str,
    resolver_address: &str,
    revokable: bool,
) -> Result<[u8; 32], GetSchemaUidError> {
    let schema_token = Token::String(schema.to_string());
    let resolver_address: Address = resolver_address
        .parse::<Address>()
        .map_err(|e| GetSchemaUidError::AddressParseError(e.to_string()))?;
    let resolver_address_token = Token::Address(resolver_address);
    let revocable_token = Token::Bool(revokable);
    let encoded = encode_packed(&[schema_token, resolver_address_token, revocable_token])
        .map_err(GetSchemaUidError::EncodePackedError)?;
    Ok(keccak256(encoded))
}

pub fn get_eas_http_headers(recipe_query_url: &str) -> Vec<HttpHeader> {
    vec![
        HttpHeader {
            name: "User-Agent".to_string(),
            value: "catts/0.0.1".to_string(),
        },
        HttpHeader {
            name: "Content-Type".to_string(),
            value: "application/json".to_string(),
        },
        HttpHeader {
            name: "x-gql-query-url".to_string(),
            value: recipe_query_url.to_string(),
        },
    ]
}

#[derive(Error, Debug)]
pub enum RunEasQueryError {
    #[error("Request failed: {message:?}, code: {rejection_code:?}")]
    HttpRequestError {
        rejection_code: RejectionCode,
        message: String,
    },
}

pub async fn run_query(
    address: &EthAddress,
    recipe_query: &RecipeQuery,
) -> Result<String, RunEasQueryError> {
    let mut dynamic_values: HashMap<String, String> = HashMap::new();
    dynamic_values.insert("user_eth_address".to_string(), address.as_str().to_string());
    dynamic_values.insert(
        "user_eth_address_lowercase".to_string(),
        address.as_str().to_lowercase(),
    );
    let variables = insert_dynamic_variables(&recipe_query.variables, &dynamic_values);
    let payload = format!(
        r#"{{"query":"{}","variables":{}}}"#,
        recipe_query.query, variables
    );
    let payload = payload.into_bytes();

    let http_headers = get_eas_http_headers(&recipe_query.endpoint);

    let mut hasher = Blake2bVar::new(12).unwrap();
    hasher.update(&payload);
    let mut cache_key = [0u8; 12];
    hasher.finalize_variable(&mut cache_key).unwrap();
    let cache_key = hex::encode(cache_key);

    let url = format!("{}/{}", THEGRAPH_QUERY_PROXY_URL, cache_key);
    let request = CanisterHttpRequestArgument {
        url,
        method: HttpMethod::GET,
        headers: http_headers,
        body: Some(payload),
        max_response_bytes: None,
        transform: Some(TransformContext::from_name(
            "transform".to_string(),
            serde_json::to_vec(&Vec::<u8>::new()).unwrap(),
        )),
    };

    match http_request(request, ETH_DEFAULT_CALL_CYCLES).await {
        Ok((response,)) => {
            Ok(String::from_utf8(response.body)
                .expect("Transformed response is not UTF-8 encoded."))
        }
        Err((r, m)) => Err(RunEasQueryError::HttpRequestError {
            rejection_code: r,
            message: m,
        }),
    }
}

pub fn process_query_result(processor: &str, query_result: &str) -> String {
    let js_process_function = format!(
        r#"
            let queryResult = JSON.parse(queryResultRaw);
            function process() {{
                {processor}
            }}
            process();
        "#
    );

    let runtime = Runtime::default();
    let context = runtime.context();

    context
        .global_object()
        .unwrap()
        .set_property(
            "queryResultRaw",
            context.value_from_str(query_result).unwrap(),
        )
        .unwrap();

    let res = context.eval_global("process.js", &js_process_function);

    match res {
        Ok(res) => res.as_str().unwrap().to_string(),
        Err(e) => {
            format!("Uncaught {e}")
        }
    }
}

// #[derive(Error, Debug)]
// // pub enum CreateAttestationError {
//     #[error("Could not load chain config")]
//     CouldNotLoadChainConfig,

//     #[error("Unable to get schema uid: {0}")]
//     UnableToGetSchemaUid(#[from] GetSchemaUidError),

//     #[error("Recipe don't have a gas amount specified")]
//     NoRecipeGasAmount,

//     #[error("Eth transaction error: {0}")]
//     EthTransaction(#[from] EthTransactionError),
// }

pub async fn create_attestation(
    recipe: &Recipe,
    run: &Run,
    attestation_data: &str,
    recipient: &EthAddress,
    chain_id: u64,
) -> Result<String> {
    let chain_config = chain_config::get(chain_id)?;

    let schema_uid = get_schema_uid(
        &recipe.schema,
        "0x0000000000000000000000000000000000000000",
        false,
    )?;

    let encoded_abi_data = encode_abi_data(attestation_data);

    let schema_token = Token::FixedBytes(schema_uid.to_vec());
    let attestation_request_data = Token::Tuple(vec![
        Token::Address(H160(recipient.as_byte_array())), // recipient
        Token::Uint((0).into()),                         // expirationTime
        Token::Bool(false),                              // revocable
        Token::FixedBytes([0u8; 32].to_vec()),           // refUID
        Token::Bytes(encoded_abi_data),                  // data
        Token::Uint((0).into()),                         // value
    ]);

    let attest_request = Token::Tuple(vec![schema_token, attestation_request_data]);

    let gas = run
        .gas
        .clone()
        .ok_or(anyhow!("Recipe don't have a gas amount specified"))?;

    let max_priority_fee_per_gas = run.max_priority_fee_per_gas.clone().ok_or(anyhow!(
        "Recipe don't have a max_priority_fee_per_gas amount specified"
    ))?;

    Ok(eth_transaction(
        chain_config.eas_contract.clone(),
        &Arc::clone(&ETH_EAS_CONTRACT),
        "attest",
        &[attest_request],
        gas,
        max_priority_fee_per_gas,
        &chain_config,
    )
    .await?)
}

// #[derive(Error, Debug)]
// pub enum EstimateAttestationGasUsageError {
//     #[error("Could not load chain config")]
//     CouldNotLoadChainConfig,

//     #[error("Unable to get schema uid: {0}")]
//     UnableToGetSchemaUid(#[from] GetSchemaUidError),

//     #[error("Eth transaction error: {0}")]
//     EthTransaction(#[from] EthTransactionError),
// }

pub async fn estimate_attestation_gas_usage(
    recipe: &Recipe,
    attestation_data: &str,
    recipient: &EthAddress,
    chain_config: &ChainConfig,
) -> Result<String> {
    let schema_uid = get_schema_uid(&recipe.schema, &recipe.resolver, recipe.revokable)?;

    let encoded_abi_data = encode_abi_data(attestation_data);

    let schema_token = Token::FixedBytes(schema_uid.to_vec());
    let attestation_request_data = Token::Tuple(vec![
        Token::Address(H160(recipient.as_byte_array())), // recipient
        Token::Uint((0).into()),                         // expirationTime
        Token::Bool(false),                              // revocable
        Token::FixedBytes([0u8; 32].to_vec()),           // refUID
        Token::Bytes(encoded_abi_data),                  // data
        Token::Uint((0).into()),                         // value
    ]);

    let attest_request = Token::Tuple(vec![schema_token, attestation_request_data]);

    let chain_config = chain_config::get(chain_config.chain_id)?;

    Ok(eth_estimate_gas(
        chain_config.eas_contract.clone(),
        &Arc::clone(&ETH_EAS_CONTRACT),
        "attest",
        &[attest_request],
        &chain_config,
    )
    .await?)
}
