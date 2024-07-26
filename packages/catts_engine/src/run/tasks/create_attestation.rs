use crate::{
    eas::{create_attestation, process_query_result, run_query},
    eth_address::EthAddress,
    logger::debug,
    recipe::{self},
    run::{self, PaymentVerifiedStatus},
    tasks::{add_task, Task, TaskError, TaskExecutor, TaskResult, TaskType},
};
use futures::Future;
use std::pin::Pin;
const GET_ATTESTATION_UID_FIRST_TIME_INTERVAL: u64 = 5_000_000_000; // 5 seconds
const GET_ATTESTATION_UID_RETRY_INTERVAL: u64 = 15_000_000_000; // 15 seconds
const GET_ATTESTATION_UID_MAX_RETRIES: u32 = 10;

pub struct CreateAttestationExecutor {}

impl TaskExecutor for CreateAttestationExecutor {
    fn execute(
        &self,
        args: Vec<u8>,
    ) -> Pin<Box<dyn Future<Output = Result<TaskResult, TaskError>> + Send>> {
        Box::pin(async move {
            let run_id = run::vec_to_run_id(args).map_err(|_| {
                TaskError::Failed("CreateAttestationExecutor: Invalid arguments".to_string())
            })?;

            let mut run = run::get_by_id(&run_id).map_err(|_| {
                TaskError::Failed("CreateAttestationExecutor: Run not found".to_string())
            })?;

            let recipe = recipe::get_by_id(&run.recipe_id).map_err(|_| {
                TaskError::Failed("CreateAttestationExecutor: Recipe not found".to_string())
            })?;

            // let chain_config = chain_config::get(run.chain_id).ok_or(TaskError::Failed(
            //     "CreateAttestationExecutor: Chain config not found".to_string(),
            // ))?;

            // Run is already attested, cancel
            if run.attestation_transaction_hash.is_some() {
                return Err(TaskError::Failed(
                    "CreateAttestationExecutor: Run already attested".to_string(),
                ));
            }

            // Run is not yet paid, pause and retry
            if run.payment_verified_status != Some(PaymentVerifiedStatus::Verified) {
                debug("CreateAttestationExecutor: Run not yet paid");
                return Ok(TaskResult::retry());
            }

            if recipe.queries.is_empty() {
                return Err(TaskError::Failed(
                    "CreateAttestationExecutor: Recipe contains no queries".to_string(),
                ));
            }

            let recipient = EthAddress::from(run.creator);
            let mut query_response = Vec::new();

            for i in 0..recipe.queries.len() {
                let response = run_query(&recipient, &recipe.queries[i]).await;
                match response {
                    Ok(qr) => {
                        query_response.push(qr);
                    }
                    Err(err) => {
                        run.attestation_create_error = Some(err.to_string());
                        run::save(run);
                        return Err(TaskError::Failed(format!(
                            "Error running EAS query: {}",
                            err
                        )));
                    }
                }
            }
            let aggregated_response = format!("[{}]", query_response.join(","));

            let attestation_data = process_query_result(&recipe.processor, &aggregated_response);

            let attestation_transaction_hash =
                create_attestation(&recipe, &run, &attestation_data, &recipient, run.chain_id)
                    .await
                    .map_err(|err| {
                        TaskError::Failed(format!("Error creating attestation: {}", err))
                    })?;

            run.attestation_transaction_hash = Some(attestation_transaction_hash.clone());
            run::save(run);

            add_task(
                ic_cdk::api::time() + GET_ATTESTATION_UID_FIRST_TIME_INTERVAL,
                Task {
                    task_type: TaskType::GetAttestationUid,
                    args: run_id.to_vec(),
                    max_retries: GET_ATTESTATION_UID_MAX_RETRIES,
                    execute_count: 0,
                    retry_interval: GET_ATTESTATION_UID_RETRY_INTERVAL,
                },
            );

            Ok(TaskResult::success())
        })
    }
}
