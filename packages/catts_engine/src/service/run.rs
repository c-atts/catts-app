use crate::{
    authenticated,
    eas::{create_attestation, process_query_result, run_eas_query},
    error::Error,
    payments::is_run_payed,
    recipe,
    run::{Run, RunId},
    siwe::get_caller_eth_address,
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
async fn run(run_id: RunId) -> Result<String, Error> {
    let cycles_before = ic_cdk::api::canister_balance();

    let address = get_caller_eth_address().await?;

    let payed = is_run_payed(&address.as_byte_array(), &run_id)
        .await
        .map_err(Error::internal_server_error)?;
    if !payed {
        return Err(Error::forbidden("Run not payed"));
    }

    let mut run = Run::get(&address.as_byte_array(), &run_id)
        .ok_or_else(|| Error::not_found("Run not found."))?;

    if run.attestation_transaction_hash.is_some() {
        return Err(Error::bad_request("Run already completed."));
    }

    let recipe = recipe::Recipe::get_by_id(&run.recipe_id)
        .ok_or_else(|| Error::not_found("Recipe not found."))?;

    let mut query_response = Vec::new();
    for i in 0..recipe.queries.len() {
        let response = run_eas_query(
            &address,
            &recipe.queries[i],
            &recipe.query_variables[i],
            &recipe.query_settings[i],
        )
        .await
        .map_err(Error::internal_server_error)?;

        query_response.push(response);
    }

    let aggregated_response = format!("[{}]", query_response.join(","));

    ic_cdk::println!("Response: {:?}", aggregated_response);

    let processed_response = process_query_result(&recipe.processor, &aggregated_response);

    ic_cdk::println!("Processed response: {:?}", processed_response);

    let transaction_hash = create_attestation(&address, &processed_response, &recipe.output_schema)
        .await
        .map_err(Error::internal_server_error)?;

    run.attestation_transaction_hash = Some(transaction_hash.clone());
    Run::update(run);

    ic_cdk::println!("Transaction hash: {:?}", transaction_hash);

    let cycles_after = ic_cdk::api::canister_balance();
    ic_cdk::println!(
        "Function: run, Cycles spent: {:?}",
        cycles_before - cycles_after
    );

    Ok(transaction_hash)
}
