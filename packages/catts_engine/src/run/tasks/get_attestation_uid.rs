use std::pin::Pin;

use crate::{
    evm_rpc::eth_get_transaction_receipt,
    logger::debug,
    run::run_service::{vec_to_run_id, Run},
    tasks::{TaskError, TaskExecutor, TaskResult},
};
use futures::Future;

pub struct GetAttestationUidExecutor {}

impl TaskExecutor for GetAttestationUidExecutor {
    fn execute(
        &self,
        args: Vec<u8>,
    ) -> Pin<Box<dyn Future<Output = Result<TaskResult, TaskError>> + Send>> {
        Box::pin(async move {
            let run_id = vec_to_run_id(args).map_err(|_| {
                TaskError::Failed("CreateAttestationExecutor: Invalid arguments".to_string())
            })?;

            let mut run = Run::get_by_id(&run_id).ok_or(TaskError::Failed(
                "CreateAttestationExecutor: Run not found".to_string(),
            ))?;

            if run.attestation_uid.is_some() {
                return Err(TaskError::Failed(
                    "CreateAttestationExecutor: Run already attested".to_string(),
                ));
            }

            let attestation_transaction_hash = match run.attestation_transaction_hash {
                Some(ref hash) => hash.clone(),
                None => {
                    debug("CreateAttestationExecutor: Run not yet attested");
                    return Ok(TaskResult::retry());
                }
            };

            let receipt = match eth_get_transaction_receipt(&attestation_transaction_hash).await {
                Ok(receipt) => receipt,
                Err(err) => {
                    debug(&format!(
                        "CreateAttestationExecutor: Error getting transaction receipt: {}",
                        err
                    ));
                    return Ok(TaskResult::retry());
                }
            };

            if receipt.logs.is_empty() {
                debug("CreateAttestationExecutor: No logs in transaction receipt");
                return Ok(TaskResult::retry());
            }

            debug("CreateAttestationExecutor: Attestation uid found");
            let uid = receipt.logs[0].data.clone();
            run.attestation_uid = Some(uid);
            Run::update(&run);

            Ok(TaskResult::success())
        })
    }
}
