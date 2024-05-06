use crate::{
    eas::{create_attestation, process_query_result, run_eas_query},
    eth::EthAddress,
    logger::debug,
    recipe::Recipe,
    run::run_service::{vec_to_run_id, PaymentVerifiedStatus, Run},
    tasks::{Task, TaskError, TaskExecutor, TaskResult, TaskType},
    TASKS,
};
use futures::Future;
use std::pin::Pin;

const GET_ATTESTATION_UID_RETRY_INTERVAL: u64 = 15_000_000_000; // 15 seconds
const GET_ATTESTATION_UID_MAX_RETRIES: u32 = 3;

pub struct CreateAttestationExecutor {}

impl TaskExecutor for CreateAttestationExecutor {
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

            // Run is already attested, cancel
            if let Some(_) = run.attestation_transaction_hash {
                return Err(TaskError::Failed(
                    "CreateAttestationExecutor: Run already attested".to_string(),
                ));
            }

            // Run is not yet paid, pause and retry
            if run.payment_verified_status != Some(PaymentVerifiedStatus::Verified) {
                debug("CreateAttestationExecutor: Run not yet paid");
                return Ok(TaskResult::retry());
            }

            let recipe = Recipe::get_by_id(&run.recipe_id).ok_or(TaskError::Failed(
                "CreateAttestationExecutor: Recipe not found".to_string(),
            ))?;

            let creator_address = EthAddress::from(run.creator);
            let mut query_response = Vec::new();
            for i in 0..recipe.queries.len() {
                let response = run_eas_query(
                    &creator_address,
                    &recipe.queries[i],
                    &recipe.query_variables[i],
                    &recipe.query_settings[i],
                )
                .await
                .map_err(|err| {
                    run.attestation_create_error = Some(err.to_string());
                    Run::update(&run);
                    TaskError::Failed(format!("Error running query: {}", err))
                })?;
                query_response.push(response);
            }
            let aggregated_response = format!("[{}]", query_response.join(","));
            let processed_response = process_query_result(&recipe.processor, &aggregated_response);

            let attestation_transaction_hash =
                create_attestation(&creator_address, &processed_response, &recipe.output_schema)
                    .await
                    .map_err(|err| {
                        TaskError::Failed(format!("Error creating attestation: {}", err))
                    })?;

            run.attestation_transaction_hash = Some(attestation_transaction_hash.clone());
            Run::update(&run);

            TASKS.with_borrow_mut(|tasks| {
                tasks.insert(
                    ic_cdk::api::time() + GET_ATTESTATION_UID_RETRY_INTERVAL,
                    Task {
                        task_type: TaskType::GetAttestationUid,
                        args: run_id.to_vec(),
                        max_retries: GET_ATTESTATION_UID_MAX_RETRIES,
                        execute_count: 0,
                        retry_interval: GET_ATTESTATION_UID_RETRY_INTERVAL,
                    },
                );
            });
            Ok(TaskResult::success())
        })
    }
}
