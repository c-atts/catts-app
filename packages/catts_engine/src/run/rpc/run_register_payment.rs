use ic_cdk::{api::canister_balance, update};

use crate::{
    error::Error,
    logger::info,
    run::{
        run::{Run, RunError, RunId},
        tasks::process_run_payment::ProcessRunPaymentArgs,
    },
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
) -> Result<Run, Error> {
    let cycles_before = canister_balance();
    let address = auth_guard()?;
    let run = match Run::get(&address.as_byte_array(), &run_id) {
        Some(run) => run,
        None => return Err(Error::not_found(RunError::NotFound)),
    };

    // Only creator can register payment
    if run.creator != address.as_byte_array() {
        return Err(Error::forbidden("Only creator can register payment"));
    }

    let result = match Run::register_payment(&address.as_byte_array(), &run_id, &transaction_hash) {
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
            RunError::TransactionHashAlreadyRegistered => Err(Error::bad_request(e)),
            RunError::NotFound => Err(Error::not_found(e)),
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
