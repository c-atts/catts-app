use crate::eth::EthAddress;
use crate::evm_rpc::{eth_transaction, get_self_eth_address};
use crate::{ETH_DEFAULT_CALL_CYCLES, ETH_EAS_CONTRACT};
use boa_engine::{js_string, property::Attribute, Context, Source};
use ethers_core::abi::{encode, encode_packed, ethereum_types::H160, Address, Token};
use ethers_core::types::U256;
use ethers_core::utils::keccak256;
use ic_cdk::api::management_canister::http_request::{
    http_request, CanisterHttpRequestArgument, HttpHeader, HttpMethod,
};
use regex::Regex;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::rc::Rc;
use std::str::FromStr;

pub type Uid = String;

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
            },
            _ if item.type_.starts_with("int") => match &item.value {
                AbiValueField::BigNumber { hex, .. } => {
                    Token::Int(U256::from_str(hex).expect("Invalid hex value"))
                }
                AbiValueField::Number(num) => Token::Int((*num).into()),
            },
            _ => panic!("Unsupported type: {}", item.type_),
        })
        .collect();

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
    Ok(keccak256(encoded))
}

pub fn get_eas_http_headers() -> Vec<HttpHeader> {
    vec![
        // HttpHeader {
        //     name: "Host".to_string(),
        //     value: "catts.run".to_string(),
        // },
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

pub fn insert_dynamic_variables(
    variables_template: &str,
    dynamic_values: &HashMap<String, String>,
) -> String {
    if variables_template.is_empty() {
        return variables_template.to_string();
    }

    let re = Regex::new(r"\{(\w+)\}").unwrap();

    re.replace_all(variables_template, |caps: &regex::Captures| {
        dynamic_values
            .get(&caps[1])
            .cloned()
            .unwrap_or_else(|| caps[0].to_string())
    })
    .to_string()
}

#[derive(Serialize, Deserialize, Debug)]
struct EasQueryPayload {
    query: String,
    variables: String,
}

pub async fn run_eas_query(
    address: &EthAddress,
    query: &str,
    query_variables: &str,
) -> Result<String, String> {
    let http_headers = get_eas_http_headers();

    let mut dynamic_values: HashMap<String, String> = HashMap::new();
    dynamic_values.insert("user_eth_address".to_string(), address.as_str().to_string());
    let variables = insert_dynamic_variables(query_variables, &dynamic_values);

    let payload = EasQueryPayload {
        query: query.to_string(),
        variables,
    };
    let payload = serde_json::to_string(&payload).map_err(|err| err.to_string())?;
    let payload = payload.into_bytes();

    let request = CanisterHttpRequestArgument {
        url: "https://optimism.easscan.org/graphql".to_string(),
        method: HttpMethod::POST,
        headers: http_headers,
        body: Some(payload),
        max_response_bytes: None,
        transform: None,
    };

    let res = match http_request(request, ETH_DEFAULT_CALL_CYCLES as u128).await {
        Ok((response,)) => {
            String::from_utf8(response.body).expect("Transformed response is not UTF-8 encoded.")
        }
        Err((r, m)) => {
            let message =
                format!("The http_request resulted into error. RejectionCode: {r:?}, Error: {m}");
            message
        }
    };

    Ok(res)
}

pub fn process_query_result(processor: &str, query_result: &str) -> String {
    let js_process_function = format!(
        r#"
            function process() {{
                const queryResultJson = JSON.parse(queryResultString); 
                const data = JSON.parse(queryResultJson?.data?.attestations[0]?.decodedDataJson); 
                {processor}
            }}
        "#
    );

    ic_cdk::println!("JS code: {:?}", js_process_function);

    let mut context = Context::default();

    context
        .register_global_property(
            js_string!("queryResultString"),
            js_string!(query_result),
            Attribute::all(),
        )
        .unwrap();

    context
        .eval(Source::from_bytes(&js_process_function))
        .unwrap();

    match context.eval(Source::from_bytes("process();")) {
        Ok(res) => res.to_string(&mut context).unwrap().to_std_string_escaped(),
        Err(e) => {
            format!("Uncaught {e}")
        }
    }
}

pub async fn create_attestation(
    recipient: &EthAddress,
    attestation_data: &str,
    schema: &str,
) -> Result<String, String> {
    let encoded_abi_data = encode_abi_data(attestation_data);

    ic_cdk::println!("Data: {:?}", hex::encode(encoded_abi_data.clone()));

    let schema_uid = get_schema_uid(schema, "0x0000000000000000000000000000000000000000", false)?;

    ic_cdk::println!("UID: {:?}", hex::encode(schema_uid));

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

    let canister_eth_address = get_self_eth_address().await;

    ic_cdk::println!("Canister eth address: {:?}", canister_eth_address);

    eth_transaction(
        String::from("0xC2679fBD37d54388Ce493F1DB75320D236e1815e"),
        &ETH_EAS_CONTRACT.with(Rc::clone),
        "attest",
        &[attest_request],
    )
    .await
}
