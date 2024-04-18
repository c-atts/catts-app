use crate::{
    authenticated,
    eas::{encode_abi_data, get_schema_uid},
    eth::EthAddress,
    eth_rpc::{eth_transaction, get_self_eth_address},
    identity::get_address,
    payments::is_run_payed,
    recipe,
    run::{Run, RunId},
    ETH_EAS_CONTRACT,
};
use boa_engine::{js_string, property::Attribute, Context, Source};
use candid::CandidType;
use ethers_core::abi::{ethereum_types::H160, Token};
use ic_cdk::api::management_canister::http_request::{
    http_request, CanisterHttpRequestArgument, HttpHeader, HttpMethod,
};
use ic_cdk::update;
use regex::Regex;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::{collections::HashMap, rc::Rc};

// Define a struct for your payload
#[derive(Serialize, Deserialize, Debug)]
struct Payload {
    query: String,
    variables: String, // Assuming variables is a JSON string itself
}

#[derive(CandidType)]
pub struct RunResult {
    s: String,
}

fn parse_variables_template(
    variables_template: &str,
    dynamic_values: &HashMap<String, String>,
) -> Value {
    if variables_template.is_empty() {
        return json!({});
    }

    let re = Regex::new(r"\{(\w+)\}").unwrap();
    let processed_template = re.replace_all(variables_template, |caps: &regex::Captures| {
        dynamic_values
            .get(&caps[1])
            .cloned()
            .unwrap_or_else(|| caps[0].to_string())
    });

    serde_json::from_str(&processed_template).unwrap_or_else(|_| json!({}))
}

fn eval(js: &str, query_result: &str) -> String {
    // let js_process_function = r#"
    //         function process() {{
    //             const queryResultJson = JSON.parse(queryResultString);
    //             const data = JSON.parse(queryResultJson?.data?.attestations[0]?.decodedDataJson);
    //             return JSON.stringify(data.map((item) => item.value));
    //         }}
    //     "#;
    let js_process_function = format!(
        r#"
            function process() {{
                const queryResultJson = JSON.parse(queryResultString); 
                const data = JSON.parse(queryResultJson?.data?.attestations[0]?.decodedDataJson); 
                {js}
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

#[update(guard=authenticated)]
async fn run(id: RunId) -> Result<RunResult, String> {
    let address = get_address().await?;
    let address = EthAddress::new(&address)?;

    let payed_result = is_run_payed(&address.as_byte_array(), &id).await?;

    if !payed_result {
        return Err("Run is not payed".to_string());
    }

    let run = Run::get(&address.as_byte_array(), &id).ok_or_else(|| "Run not found".to_string())?;

    let recipe =
        recipe::Recipe::get(&run.recipe_id).ok_or_else(|| "Recipe not found".to_string())?;

    let cycles_before = ic_cdk::api::canister_balance();

    let headers = vec![
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
    ];

    let mut dynamic_values: HashMap<String, String> = HashMap::new();
    dynamic_values.insert("user_eth_address".to_string(), address.as_str().to_string());

    let variables = parse_variables_template(&recipe.query_variables[0], &dynamic_values);

    let payload = Payload {
        query: recipe.queries[0].to_string(),
        variables: serde_json::to_string(&variables).unwrap(),
    };

    ic_cdk::println!("Payload: {:?}", payload);

    let payload = serde_json::to_string(&payload).unwrap();
    let payload = payload.into_bytes();

    let request = CanisterHttpRequestArgument {
        url: "https://optimism.easscan.org/graphql".to_string(),
        method: HttpMethod::POST,
        headers,
        body: Some(payload),
        max_response_bytes: None,
        transform: None,
    };

    ic_cdk::println!("Request: {:?}", request);

    let res = match http_request(request, 1_000_000_000_000).await {
        Ok((response,)) => {
            String::from_utf8(response.body).expect("Transformed response is not UTF-8 encoded.")
        }
        Err((r, m)) => {
            let message =
                format!("The http_request resulted into error. RejectionCode: {r:?}, Error: {m}");
            message
        }
    };

    ic_cdk::println!("Response: {:?}", res);

    let processed_res = eval(&recipe.processor, &res);

    ic_cdk::println!("Processed response: {:?}", processed_res);

    let data = encode_abi_data(&processed_res);

    ic_cdk::println!("Data: {:?}", hex::encode(data.clone()));

    let schema_uid = get_schema_uid(
        &recipe.output_schema,
        "0x0000000000000000000000000000000000000000",
        false,
    )?;

    ic_cdk::println!("UID: {:?}", hex::encode(schema_uid));

    let schema_token = Token::FixedBytes(schema_uid.to_vec());

    let attestation_request_data = Token::Tuple(vec![
        Token::Address(H160(address.as_byte_array())), // recipient
        Token::Uint((0).into()),                       // expirationTime
        Token::Bool(false),                            // revocable
        Token::FixedBytes([0u8; 32].to_vec()),         // refUID
        Token::Bytes(data),                            // data
        Token::Uint((0).into()),                       // value
    ]);

    let attest_request = Token::Tuple(vec![schema_token, attestation_request_data]);

    ic_cdk::println!("My eth address: {:?}", get_self_eth_address().await);

    let res = eth_transaction(
        String::from("0xC2679fBD37d54388Ce493F1DB75320D236e1815e"),
        &ETH_EAS_CONTRACT.with(Rc::clone),
        "attest",
        &[attest_request],
    )
    .await;

    ic_cdk::println!("Transaction result: {:?}", res);

    let cycles_after = ic_cdk::api::canister_balance();
    ic_cdk::println!("Cycles spent: {:?}", cycles_before - cycles_after);

    Ok(RunResult {
        s: "Run is payed".to_string(),
    })
}
