use crate::{
    authenticated, eth::EthAddress, evm_rpc::eth_get_transaction_receipt, run::Run,
    siwe::get_address,
};
use ic_cdk::update;

#[update(guard = authenticated)]
async fn get_my_runs() -> Result<Vec<Run>, String> {
    let address = get_address().await.map_err(|e| e.to_string())?;
    let address = EthAddress::new(&address).map_err(|e| e.to_string())?;

    let mut runs = Run::get_by_address(&address.as_byte_array());

    // Fetch attestation UID for runs that have attestation transaction hash but no attestation UID
    for run in &mut runs {
        if let Some(tx) = &run.attestation_transaction_hash {
            if run.attestation_uid.is_none() {
                let receipt_result = eth_get_transaction_receipt(tx).await;
                match receipt_result {
                    Ok(receipt) => {
                        if receipt.logs.is_empty() {
                            ic_cdk::println!("No logs in transaction receipt");
                            continue;
                        }
                        let uid = receipt.logs[0].data.clone();
                        run.attestation_uid = Some(uid);
                        Run::update(run.clone()); // Ensure this operation does not fail silently or handle its potential error.
                    }
                    Err(e) => {
                        ic_cdk::println!("Error getting transaction receipt: {}", e);
                        continue;
                    }
                }
            }
        }
    }

    Ok(runs)
}
