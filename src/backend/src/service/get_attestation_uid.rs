use ic_cdk::update;

use crate::{
    authenticated,
    eth::EthAddress,
    evm_rpc::eth_get_transaction_receipt,
    run::{Run, RunId},
    siwe::get_address,
};

#[update(guard = authenticated)]
pub async fn get_attestation_uid(run_id: RunId) -> Result<String, String> {
    let cycles_before = ic_cdk::api::canister_balance();

    let address = get_address().await?;
    let address = EthAddress::new(&address)?;

    let mut run =
        Run::get(&address.as_byte_array(), &run_id).ok_or_else(|| "Run not found".to_string())?;

    if run.attestation_uid.is_some() {
        return Ok(run.attestation_uid.unwrap());
    }

    let tx_hash = run
        .attestation_transaction_hash
        .clone()
        .ok_or_else(|| "No attestation transaction hash".to_string())?;

    let receipt_result = eth_get_transaction_receipt(&tx_hash).await?;

    if receipt_result.logs.is_empty() {
        return Err("No logs in transaction receipt".to_string());
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
