use crate::{
    chain_config::{self},
    eth_address::EthAddress,
    evm::rpc::eth_transaction,
    graphql::replace_dynamic_variables,
    logger::{self},
    recipe::{Recipe, RecipeQuery},
    run::Run,
    ETH_DEFAULT_CALL_CYCLES, ETH_EAS_CONTRACT, QUERY_PROXY_URL,
};
use anyhow::{anyhow, bail, Result};
use blake2::{
    digest::{Update, VariableOutput},
    Blake2bVar,
};
use ethers_core::{
    abi::{encode, encode_packed, ethereum_types::H160, Address, Token},
    types::U256,
    utils::{hex, keccak256},
};
use ic_cdk::api::management_canister::http_request::{
    http_request, CanisterHttpRequestArgument, HttpMethod, TransformContext,
};
use javy::Runtime;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::{str::FromStr, sync::Arc};
use thiserror::Error;

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

pub fn encode_abi_data(json_data: &str) -> Result<Vec<u8>> {
    let schema_items: Vec<SchemaItem> =
        serde_json::from_str(json_data).map_err(|e| anyhow!("Failed to parse JSON: {}", e))?;

    let tokens: Vec<Token> = schema_items
        .iter()
        .map(|item| match item.type_field.as_str() {
            _ if item.type_field == "address" => match &item.value {
                SchemaValue::String(hex) => {
                    let address = Address::from_str(hex)
                        .map_err(|e| anyhow!("Invalid address hex value: {}", e))?;
                    Ok(Token::Address(address))
                }
                _ => Err(anyhow!("Unsupported value for address: {:?}", item.value)),
            },
            _ if item.type_field == "string" => match &item.value {
                SchemaValue::String(val) => Ok(Token::String(val.clone())),
                _ => Err(anyhow!("Unsupported value for string: {:?}", item.value)),
            },
            _ if item.type_field == "bool" => match &item.value {
                SchemaValue::Bool(val) => Ok(Token::Bool(*val)),
                _ => Err(anyhow!("Unsupported value for bool: {:?}", item.value)),
            },
            _ if item.type_field == "bytes" => match &item.value {
                SchemaValue::String(hex) => {
                    let bytes =
                        hex::decode(hex).map_err(|e| anyhow!("Invalid hex value: {}", e))?;
                    Ok(Token::Bytes(bytes))
                }
                _ => Err(anyhow!("Unsupported value for bytes: {:?}", item.value)),
            },
            _ if item.type_field == "bytes32" => match &item.value {
                SchemaValue::String(hex) => {
                    let bytes = hex::decode(hex)
                        .map_err(|e| anyhow!("Invalid hex value for bytes32: {}", e))?;
                    Ok(Token::FixedBytes(bytes))
                }
                _ => Err(anyhow!("Unsupported value for bytes32: {:?}", item.value)),
            },
            _ if item.type_field.starts_with("uint") => match &item.value {
                SchemaValue::String(hex) => {
                    let uint = U256::from_str(hex)
                        .map_err(|e| anyhow!("Invalid hex value for uint: {}", e))?;
                    Ok(Token::Uint(uint))
                }
                SchemaValue::Number(num) => Ok(Token::Uint((*num).into())),
                _ => Err(anyhow!("Unsupported value for uint: {:?}", item.value)),
            },
            _ if item.type_field.starts_with("int") => match &item.value {
                SchemaValue::String(hex) => {
                    let int = U256::from_str(hex)
                        .map_err(|e| anyhow!("Invalid hex value for int: {}", e))?;
                    Ok(Token::Int(int))
                }
                SchemaValue::Number(num) => Ok(Token::Int((*num).into())),
                _ => Err(anyhow!("Unsupported value for int: {:?}", item.value)),
            },
            _ => Err(anyhow!("Unsupported type: {}", item.type_field)),
        })
        .collect::<Result<Vec<Token>>>()?; // Collecting and propagating errors

    // Encode the tokens
    Ok(encode(&tokens))
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

fn get_body(recipe_query: &RecipeQuery, address: &EthAddress) -> Result<String> {
    let mut query_body = json!({
        "url": replace_dynamic_variables(&recipe_query.url, address),
    });

    if let Some(headers) = &recipe_query.headers {
        if let Value::Object(ref mut map) = query_body {
            let processed_headers = replace_dynamic_variables(headers, address);
            map.insert("headers".to_string(), Value::String(processed_headers));
        }
    }

    if let Some(filter) = &recipe_query.filter {
        if let Value::Object(ref mut map) = query_body {
            let processed_filter = replace_dynamic_variables(filter, address);
            map.insert("filter".to_string(), Value::String(processed_filter));
        }
    }

    if let Some(body) = &recipe_query.body {
        if let Value::Object(ref mut map) = query_body {
            let processed_variables = replace_dynamic_variables(&body.variables, address);
            let variables_json: Value = serde_json::from_str(&processed_variables)
                .map_err(|e| anyhow!("Failed to parse variables into JSON: {}", e))?;
            map.insert(
                "body".to_string(),
                json!({
                    "query": body.query,
                    "variables": variables_json,
                }),
            );
        }
    }

    Ok(query_body.to_string())
}

pub async fn run_query(address: &EthAddress, recipe_query: &RecipeQuery) -> Result<String> {
    logger::debug("run_query");
    let body = get_body(recipe_query, address)?.into_bytes();

    let mut hasher = Blake2bVar::new(12).unwrap();
    hasher.update(&body);
    let mut cache_key = [0u8; 12];
    hasher.finalize_variable(&mut cache_key).unwrap();
    let cache_key = hex::encode(cache_key);

    let url = format!("{}/{}", QUERY_PROXY_URL, cache_key);

    let request = CanisterHttpRequestArgument {
        url,
        method: HttpMethod::POST,
        headers: vec![],
        body: Some(body),
        max_response_bytes: Some(4_096),
        transform: Some(TransformContext::from_name("transform".to_string(), vec![])),
    };

    logger::debug(&format!("run_query https outcall: url: {:?}", request.url));

    match http_request(request, ETH_DEFAULT_CALL_CYCLES).await {
        Ok((response,)) => {
            logger::debug(&format!(
                "run_query https outcall ok, response: {:?}",
                String::from_utf8(response.body.clone())
            ));
            Ok(String::from_utf8(response.body)
                .expect("Transformed response is not UTF-8 encoded."))
        }
        Err((r, m)) => {
            logger::debug(&format!(
                "run_query https outcall error, code: {:?}, message {:?}",
                r, m
            ));
            bail!("Failed to run query. Code: {:?}, Message: {}", r, m)
        }
    }
}

pub fn process_query_result(processor: &str, query_result: &str) -> String {
    logger::debug("process_query_result");
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

pub fn create_attest_request(
    recipe: &Recipe,
    attestation_data: &str,
    recipient: &EthAddress,
) -> Result<Token> {
    logger::debug("create_attest_request");

    let schema_uid = get_schema_uid(&recipe.schema, &recipe.resolver, recipe.revokable)?;

    let encoded_abi_data = encode_abi_data(attestation_data)?;

    let schema_token = Token::FixedBytes(schema_uid.to_vec());
    let attestation_request_data = Token::Tuple(vec![
        Token::Address(H160(recipient.as_byte_array())), // recipient
        Token::Uint((0).into()),                         // expirationTime
        Token::Bool(false),                              // revocable
        Token::FixedBytes([0u8; 32].to_vec()),           // refUID
        Token::Bytes(encoded_abi_data),                  // data
        Token::Uint((0).into()),                         // value
    ]);

    Ok(Token::Tuple(vec![schema_token, attestation_request_data]))
}

pub async fn create_attestation(
    recipe: &Recipe,
    run: &Run,
    attestation_data: &str,
    recipient: &EthAddress,
    chain_id: u32,
) -> Result<String> {
    logger::debug("create_attestation");

    let attest_request = create_attest_request(recipe, attestation_data, recipient)?;

    let gas = run
        .gas
        .clone()
        .ok_or(anyhow!("Recipe don't have a gas amount specified"))?;

    let base_fee_per_gas = run.base_fee_per_gas.clone().ok_or(anyhow!(
        "Run don't have a base_fee_per_gas amount specified"
    ))?;

    let max_priority_fee_per_gas = run.max_priority_fee_per_gas.clone().ok_or(anyhow!(
        "Run don't have a max_priority_fee_per_gas amount specified"
    ))?;

    let chain_config = chain_config::get(chain_id)?;

    Ok(eth_transaction(
        chain_config.eas_contract.clone(),
        &Arc::clone(&ETH_EAS_CONTRACT),
        "attest",
        &[attest_request],
        gas,
        base_fee_per_gas,
        Some(max_priority_fee_per_gas),
        &chain_config,
    )
    .await?)
}
