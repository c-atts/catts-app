use crate::{
    authenticated,
    eas::{create_attestation, process_query_result, run_eas_query},
    eth::EthAddress,
    payments::is_run_payed,
    recipe,
    run::{Run, RunId},
    siwe::get_address,
};
use candid::CandidType;
use ic_cdk::update;
use serde::{Deserialize, Serialize};

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

#[update(guard=authenticated)]
async fn run(run_id: RunId) -> Result<String, String> {
    let cycles_before = ic_cdk::api::canister_balance();

    let address = get_address().await?;
    let address = EthAddress::new(&address)?;

    if !is_run_payed(&address.as_byte_array(), &run_id).await? {
        return Err("Run is not payed".to_string());
    }

    let mut run =
        Run::get(&address.as_byte_array(), &run_id).ok_or_else(|| "Run not found".to_string())?;

    if run.attestation_transaction_hash.is_some() {
        return Err("Run already processed".to_string());
    }

    let recipe =
        recipe::Recipe::get(&run.recipe_id).ok_or_else(|| "Recipe not found".to_string())?;

    let mut query_response = Vec::new();
    for i in 0..recipe.queries.len() {
        let response = run_eas_query(
            &address,
            &recipe.queries[i],
            &recipe.query_variables[i],
            &recipe.query_settings[i],
        )
        .await?;

        query_response.push(response);
    }

    let aggregated_response = format!("[{}]", query_response.join(","));

    ic_cdk::println!("Response: {:?}", aggregated_response);

    let processed_response = process_query_result(&recipe.processor, &aggregated_response);

    ic_cdk::println!("Processed response: {:?}", processed_response);

    let transaction_result =
        create_attestation(&address, &processed_response, &recipe.output_schema).await;

    if transaction_result.is_ok() {
        run.attestation_transaction_hash = Some(transaction_result.clone().unwrap());
        Run::update(run);
    }

    ic_cdk::println!("Transaction result: {:?}", transaction_result);

    let cycles_after = ic_cdk::api::canister_balance();
    ic_cdk::println!(
        "Function: run, Cycles spent: {:?}",
        cycles_before - cycles_after
    );

    transaction_result
}
