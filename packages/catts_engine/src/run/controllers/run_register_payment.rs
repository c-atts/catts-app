use crate::error::Error;
use crate::logger::info;
use crate::run::run_service::{Run, RunError, RunId};
use crate::siwe::get_authenticated_eth_address;
use crate::tasks::{Task, TaskType};
use crate::TASKS;
use ic_cdk::update;

const PROCESS_PAYMENTS_RETRY_INTERVAL: u64 = 15_000_000_000; // 15 seconds
const PROCESS_PAYMENTS_MAX_RETRIES: u32 = 3;

#[update]
async fn run_register_payment(run_id: RunId, transaction_hash: String) -> Result<Run, Error> {
    let cycles_before = ic_cdk::api::canister_balance();
    let address = get_authenticated_eth_address().await?;

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
            TASKS.with_borrow_mut(|tasks| {
                tasks.insert(
                    0, // Run task immediately
                    Task {
                        task_type: TaskType::ProcessRunPayments,
                        args: vec![],
                        max_retries: PROCESS_PAYMENTS_MAX_RETRIES,
                        execute_count: 0,
                        retry_interval: PROCESS_PAYMENTS_RETRY_INTERVAL,
                    },
                );
            });
            Ok(run)
        }
        Err(e) => match e {
            RunError::AlreadyPaid => Err(Error::bad_request(e)),
            RunError::NotFound => Err(Error::not_found(e)),
        },
    };

    let cycles_after = ic_cdk::api::canister_balance();
    info(
        format!(
            "run_register_payment, cycles spent: {:?}",
            cycles_before - cycles_after
        )
        .as_str(),
    );

    result
}
