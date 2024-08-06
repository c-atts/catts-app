use std::pin::Pin;

use crate::{
    chain_config::{self},
    evm::rpc::eth_get_transaction_receipt,
    logger,
    run::{self},
    tasks::{Task, TaskError, TaskExecutor},
};
use futures::Future;

use super::util::save_error_and_cancel;

pub struct GetAttestationUidExecutor {}

impl TaskExecutor for GetAttestationUidExecutor {
    fn execute(&self, task: Task) -> Pin<Box<dyn Future<Output = Result<(), TaskError>> + Send>> {
        Box::pin(async move {
            let run_id = run::vec_to_run_id(task.args)
                .map_err(|_| TaskError::Cancel("Invalid arguments".to_string()))?;

            let mut run = run::get(&run_id)
                .map_err(|_| save_error_and_cancel(&run_id, "Run not found".to_string()))?;

            if run.attestation_uid.is_some() {
                save_error_and_cancel(&run_id, "Run already attested".to_string());
            }

            let chain_config = chain_config::get(run.chain_id).map_err(|_| {
                save_error_and_cancel(&run_id, "Chain config not found".to_string())
            })?;

            let attestation_transaction_hash = match run.attestation_transaction_hash {
                Some(ref hash) => hash.clone(),
                None => {
                    return Err(save_error_and_cancel(
                        &run_id,
                        "No attestation transaction hash".to_string(),
                    ));
                }
            };

            let receipt =
                match eth_get_transaction_receipt(&attestation_transaction_hash, &chain_config)
                    .await
                {
                    Ok(receipt) => receipt,
                    Err(err) => {
                        return Err(TaskError::Retry(err.to_string()));
                    }
                };

            if receipt.logs.is_empty() {
                return Err(TaskError::Retry(
                    "No logs in transaction receipt".to_string(),
                ));
            }

            logger::debug("Attestation uid found");
            let uid = receipt.logs[0].data.clone();
            run.attestation_uid = Some(uid);
            run::update(run).unwrap();

            Ok(())
        })
    }
}
