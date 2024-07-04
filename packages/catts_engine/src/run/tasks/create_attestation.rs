use crate::{
    chain_config::ChainConfig,
    eas::{create_attestation, process_query_result, run_eas_query},
    eth::EthAddress,
    logger::debug,
    recipe::{Recipe, RecipeQuerySettings},
    run::run::{vec_to_run_id, PaymentVerifiedStatus, Run},
    tasks::{add_task, Task, TaskError, TaskExecutor, TaskResult, TaskType},
    thegraph::run_thegraph_query,
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
            let run_id = vec_to_run_id(args).map_err(|_| {
                TaskError::Failed("CreateAttestationExecutor: Invalid arguments".to_string())
            })?;

            let mut run = Run::get_by_id(&run_id).ok_or(TaskError::Failed(
                "CreateAttestationExecutor: Run not found".to_string(),
            ))?;

            let recipe = Recipe::get_by_id(&run.recipe_id).ok_or(TaskError::Failed(
                "CreateAttestationExecutor: Recipe not found".to_string(),
            ))?;

            let chain_config = ChainConfig::get(run.chain_id).ok_or(TaskError::Failed(
                "CreateAttestationExecutor: Chain config not found".to_string(),
            ))?;

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

            let (queries, query_settings, query_variables) =
                recipe.get_queries_settings_and_variables();

            if queries.is_empty() {
                return Err(TaskError::Failed(
                    "CreateAttestationExecutor: Recipe contains no queries".to_string(),
                ));
            }

            let recipient = EthAddress::from(run.creator);
            let mut query_response = Vec::new();

            for i in 0..queries.len() {
                let query_settings =
                    serde_json::from_str::<RecipeQuerySettings>(&query_settings[i]).map_err(
                        |err| TaskError::Failed(format!("Error parsing query settings: {}", err)),
                    )?;

                let response = match query_settings.query_type.as_str() {
                    "eas" => run_eas_query(
                        &recipient,
                        &queries[i],
                        &query_variables[i],
                        &query_settings,
                    )
                    .await
                    .map_err(|err| {
                        run.attestation_create_error = Some(err.to_string());
                        Run::update(&run);
                        TaskError::Failed(format!("Error running EAS query: {}", err))
                    })?,
                    "thegraph" => run_thegraph_query(
                        &recipient,
                        &queries[i],
                        &query_variables[i],
                        &query_settings,
                    )
                    .await
                    .map_err(|err| {
                        run.attestation_create_error = Some(err.to_string());
                        Run::update(&run);
                        TaskError::Failed(format!("Error running TheGraph query: {}", err))
                    })?,
                    _ => {
                        return Err(TaskError::Failed(format!(
                            "CreateAttestationExecutor: Unsupported query type: {}",
                            query_settings.query_type
                        )));
                    }
                };
                query_response.push(response);
            }
            let aggregated_response = format!("[{}]", query_response.join(","));

            let processor = recipe.processor.as_ref().ok_or_else(|| {
                TaskError::Failed(
                    "CreateAttestationExecutor: Recipe contains no processor".to_string(),
                )
            })?;

            let attestation_data = process_query_result(processor, &aggregated_response);

            let attestation_transaction_hash =
                create_attestation(&recipe, &attestation_data, &recipient, &chain_config)
                    .await
                    .map_err(|err| {
                        TaskError::Failed(format!("Error creating attestation: {}", err))
                    })?;

            run.attestation_transaction_hash = Some(attestation_transaction_hash.clone());
            Run::update(&run);

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
