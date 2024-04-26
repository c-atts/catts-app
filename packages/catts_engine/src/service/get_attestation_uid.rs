use ic_cdk::update;

use crate::{
    authenticated,
    error::Error,
    evm_rpc::eth_get_transaction_receipt,
    run::{Run, RunId},
    siwe::get_caller_eth_address,
};

#[update(guard = authenticated)]
pub async fn get_attestation_uid(run_id: RunId) -> Result<String, Error> {
    let cycles_before = ic_cdk::api::canister_balance();

    let address = get_caller_eth_address().await?;

    let mut run = Run::get(&address.as_byte_array(), &run_id)
        .ok_or_else(|| Error::not_found("Run not found."))?;

    if run.attestation_uid.is_some() {
        return Ok(run.attestation_uid.unwrap());
    }

    let tx_hash = run
        .attestation_transaction_hash
        .clone()
        .ok_or_else(|| Error::bad_request("No attestation transaction hash"))?;

    let receipt_result = eth_get_transaction_receipt(&tx_hash)
        .await
        .map_err(Error::internal_server_error)?;

    if receipt_result.logs.is_empty() {
        return Err(Error::internal_server_error(
            "No logs in transaction receipt",
        ));
    }

    let uid = receipt_result.logs[0].data.clone();

    run.attestation_uid = Some(uid.clone());
    run.status = crate::run::RunStatus::Completed;
    Run::update(run);

    let cycles_after = ic_cdk::api::canister_balance();
    ic_cdk::println!(
        "Function: poll_attestation_transaction_uid, Cycles spent: {:?}",
        cycles_before - cycles_after
    );

    Ok(uid)
}
