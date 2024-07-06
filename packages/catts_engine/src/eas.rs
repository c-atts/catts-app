use crate::chain_config::ChainConfig;
use crate::eth::EthAddress;
use crate::evm_rpc::{eth_transaction, EthTransactionError};
use crate::graphql::insert_dynamic_variables;
use crate::recipe::{Recipe, RecipeQuery};
use crate::{ETH_DEFAULT_CALL_CYCLES, ETH_EAS_CONTRACT};
use blake2::digest::{Update, VariableOutput};
use blake2::Blake2bVar;
use ethers_core::abi::{encode, encode_packed, ethereum_types::H160, Address, Token};
use ethers_core::types::U256;
use ethers_core::utils::keccak256;
use ic_cdk::api::call::RejectionCode;
use ic_cdk::api::management_canister::http_request::{
    http_request, CanisterHttpRequestArgument, HttpHeader, HttpMethod, TransformContext,
};
use javy::Runtime;
use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::str::FromStr;
use std::sync::Arc;
use thiserror::Error;
pub type Uid = String;

lazy_static! {
    static ref EAS_CHAIN_GQL_ENDPOINT: HashMap<u32, &'static str> = {
        let mut m = HashMap::new();
        m.insert(
            10,
            "https://eas-graphql-proxy.kristofer-977.workers.dev/graphql/optimism",
        );
        m.insert(
            11155111,
            "https://eas-graphql-proxy.kristofer-977.workers.dev/graphql/sepolia",
        );
        m.insert(
            8453,
            "https://eas-graphql-proxy.kristofer-977.workers.dev/graphql/base",
        );
        m
    };
}

#[derive(Serialize, Deserialize, Debug)]
struct AbiValue {
    name: String,
    #[serde(rename = "type")]
    type_: String,
    value: AbiValueField,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(untagged)]
enum AbiValueField {
    BigNumber {
        #[serde(rename = "type")]
        type_: String,
        hex: String,
    },
    Number(u64),
    Bool(bool),
}

pub fn encode_abi_data(json_data: &str) -> Vec<u8> {
    // Parse the JSON string into structs
    let abi_values: Vec<AbiValue> = serde_json::from_str(json_data).expect("Failed to parse JSON");

    let tokens: Vec<Token> = abi_values
        .iter()
        .map(|item| match item.type_.as_str() {
            _ if item.type_.starts_with("uint") => match &item.value {
                AbiValueField::BigNumber { hex, .. } => {
                    Token::Uint(U256::from_str(hex).expect("Invalid hex value"))
                }
                AbiValueField::Number(num) => Token::Uint((*num).into()),
                _ => panic!("Unsupported value: {:?}", item.value),
            },
            _ if item.type_.starts_with("int") => match &item.value {
                AbiValueField::BigNumber { hex, .. } => {
                    Token::Int(U256::from_str(hex).expect("Invalid hex value"))
                }
                AbiValueField::Number(num) => Token::Int((*num).into()),
                _ => panic!("Unsupported value: {:?}", item.value),
            },
            _ if item.type_ == "bool" => match &item.value {
                AbiValueField::Bool(val) => Token::Bool(*val),
                _ => panic!("Unsupported value: {:?}", item.value),
            },
            _ => panic!("Unsupported type: {}", item.type_),
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

pub fn get_eas_http_headers() -> Vec<HttpHeader> {
    vec![
        HttpHeader {
            name: "User-Agent".to_string(),
            value: "catts/0.0.1".to_string(),
        },
        HttpHeader {
            name: "Content-Type".to_string(),
            value: "application/json".to_string(),
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

    let http_headers = get_eas_http_headers();

    let mut hasher = Blake2bVar::new(12).unwrap();
    hasher.update(&payload);
    let mut cache_key = [0u8; 12];
    hasher.finalize_variable(&mut cache_key).unwrap();
    let cache_key = hex::encode(cache_key);

    let url = format!("{}/{}", recipe_query.endpoint, cache_key);
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

    match http_request(request, ETH_DEFAULT_CALL_CYCLES as u128).await {
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
            let queryResult = JSON.parse(queryResultRaw).map((res) => res.data);
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

#[derive(Error, Debug)]
pub enum CreateAttestationError {
    #[error("Unable to get schema uid: {0}")]
    GetSchemaUidError(#[from] GetSchemaUidError),

    #[error("Recipe don't have a gas amount specified")]
    NoRecipeGasAmount,

    #[error("Eth transaction error: {0}")]
    EthTransactionError(#[from] EthTransactionError),
}

pub async fn create_attestation(
    recipe: &Recipe,
    attestation_data: &str,
    recipient: &EthAddress,
    chain_config: &ChainConfig,
) -> Result<String, CreateAttestationError> {
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

    let gas = recipe
        .gas
        .as_ref()
        .ok_or(CreateAttestationError::NoRecipeGasAmount)?;

    eth_transaction(
        chain_config.eas_contract.clone(),
        &Arc::clone(&ETH_EAS_CONTRACT),
        "attest",
        &[attest_request],
        gas.clone(),
        chain_config,
    )
    .await
    .map_err(CreateAttestationError::EthTransactionError)
}
