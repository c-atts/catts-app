use crate::{
    eth::EthAddress, graphql::insert_dynamic_variables, recipe::RecipeQuerySettings,
    ETH_DEFAULT_CALL_CYCLES, THEGRAPH_QUERY_PROXY_URL,
};
use blake2::digest::{Update, VariableOutput};
use blake2::Blake2bVar;
use ic_cdk::api::management_canister::http_request::{
    http_request, CanisterHttpRequestArgument, HttpHeader, HttpMethod, TransformContext,
};
use std::collections::HashMap;

pub async fn run_thegraph_query(
    address: &EthAddress,
    query: &str,
    query_variables: &str,
    query_settings: &RecipeQuerySettings,
) -> Result<String, String> {
    let mut dynamic_values: HashMap<String, String> = HashMap::new();
    dynamic_values.insert("user_eth_address".to_string(), address.as_str().to_string());
    dynamic_values.insert(
        "user_eth_address_lowercase".to_string(),
        address.as_str().to_lowercase(),
    );
    let variables = insert_dynamic_variables(query_variables, &dynamic_values);
    let payload = format!(r#"{{"query":"{}","variables":{}}}"#, query, variables);
    let payload = payload.into_bytes();

    let thegraph_query_url = query_settings
        .thegraph_query_url
        .as_ref()
        .ok_or_else(|| "TheGraph query URL is required for TheGraph query".to_string())?;

    let http_headers = vec![
        HttpHeader {
            name: "User-Agent".to_string(),
            value: "catts/0.0.1".to_string(),
        },
        HttpHeader {
            name: "Content-Type".to_string(),
            value: "application/json".to_string(),
        },
        HttpHeader {
            name: "x-thegraph-query-url".to_string(),
            value: thegraph_query_url.to_string(),
        },
    ];

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

    match http_request(request, ETH_DEFAULT_CALL_CYCLES as u128).await {
        Ok((response,)) => {
            Ok(String::from_utf8(response.body)
                .expect("Transformed response is not UTF-8 encoded."))
        }
        Err((r, m)) => Err(format!(
            "Request to EAS failed. RejectionCode: {r:?}, Error: {m}"
        )),
    }
}
