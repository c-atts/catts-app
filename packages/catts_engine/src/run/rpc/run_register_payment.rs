use ic_cdk::{api::canister_balance, update};

use crate::{
    http_error::HttpError,
    logger::info,
    run::{self, tasks::process_run_payment::ProcessRunPaymentArgs, Run, RunError, RunId},
    tasks::{add_task, Task, TaskType},
    user::auth_guard,
};

const PROCESS_RUN_PAYMENT_RETRY_INTERVAL: u64 = 15_000_000_000; // 15 seconds
const PROCESS_RUN_PAYMENT_MAX_RETRIES: u32 = 3;

#[update]
async fn run_register_payment(
    run_id: RunId,
    transaction_hash: String,
    block_to_process: u128,
) -> Result<Run, HttpError> {
    let cycles_before = canister_balance();
    let address = auth_guard()?;
    let run = match run::get(&address, &run_id) {
        Some(run) => run,
        None => return Err(HttpError::not_found(RunError::NotFound)),
    };

    // Only creator can register payment
    if run.creator != address.as_byte_array() {
        return Err(HttpError::forbidden("Only creator can register payment"));
    }

    let result = match run::register_payment(&address.as_byte_array(), &run_id, &transaction_hash) {
        Ok(run) => {
            let args: Vec<u8> = bincode::serialize(&ProcessRunPaymentArgs {
                block_to_process,
                from_address: address.as_byte_array(),
                run_id,
            })
            .unwrap();

            add_task(
                0, // Run ASAP
                Task {
                    task_type: TaskType::ProcessRunPayment,
                    args,
                    max_retries: PROCESS_RUN_PAYMENT_MAX_RETRIES,
                    execute_count: 0,
                    retry_interval: PROCESS_RUN_PAYMENT_RETRY_INTERVAL,
                },
            );

            Ok(run)
        }
        Err(e) => match e {
            RunError::TransactionHashAlreadyRegistered => Err(HttpError::bad_request(e)),
            RunError::NotFound => Err(HttpError::not_found(e)),
        },
    };

    let cycles_after = canister_balance();
    info(
        format!(
            "run_register_payment, cycles spent: {:?}",
            cycles_before - cycles_after
        )
        .as_str(),
    );

    result
}
