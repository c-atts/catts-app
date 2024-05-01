use crate::logger::debug;
use crate::run::tasks::create_attestation::CreateAttestationExecutor;
use crate::run::tasks::get_attestation_uid::GetAttestationUidExecutor;
use crate::run::tasks::process_run_payments::ProcessRunPaymentsExecutor;
use crate::{logger::error, TASKS};
use candid::{CandidType, Decode, Encode};
use ic_stable_structures::{storable::Bound, Storable};
use serde::Deserialize;
use std::borrow::Cow;
use std::future::Future;
use std::pin::Pin;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum TaskError {
    #[error("Task failed: {0}")]
    Failed(String),
}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub enum TaskType {
    ProcessRunPayments,
    CreateAttestation,
    GetAttestationUid,
}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct Task {
    pub task_type: TaskType,
    pub args: Vec<u8>,
    pub max_retries: u32,
    pub retry_interval: u64,
    pub execute_count: u32,
}

impl Storable for Task {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

pub struct TaskOkResult {
    pub retry_allowed: bool,
}

impl TaskOkResult {
    pub fn retry_allowed() -> Self {
        TaskOkResult {
            retry_allowed: true,
        }
    }

    pub fn cancel() -> Self {
        TaskOkResult {
            retry_allowed: false,
        }
    }
}

pub trait TaskExecutor {
    fn execute(
        &self,
        args: Vec<u8>,
    ) -> Pin<Box<dyn Future<Output = Result<TaskOkResult, TaskError>> + Send>>;
}

pub fn execute_tasks() {
    let mut tasks_to_process: Vec<Task> = Vec::new();
    let current_time = ic_cdk::api::time();

    TASKS.with_borrow_mut(|tasks| {
        while let Some((task_scheduled_time, _)) = tasks.first_key_value() {
            if task_scheduled_time > current_time {
                break;
            }

            if let Some((_, task)) = tasks.pop_first() {
                tasks_to_process.push(task);
            }
        }
    });

    for task in tasks_to_process {
        execute_task(task);
    }
}

fn execute_task(task: Task) {
    debug(
        format!(
            "Executing task {:?}, retry {:?}",
            task.task_type,
            task.execute_count + 1
        )
        .as_str(),
    );
    ic_cdk::spawn(async move {
        match get_executor_for_task(&task)
            .execute(task.args.clone())
            .await
        {
            Ok(result) => handle_task_result(task, result),
            Err(e) => error(&e.to_string()),
        }
    });
}

fn get_executor_for_task(task: &Task) -> Box<dyn TaskExecutor> {
    match task.task_type {
        TaskType::ProcessRunPayments => Box::new(ProcessRunPaymentsExecutor {}),
        TaskType::CreateAttestation => Box::new(CreateAttestationExecutor {}),
        TaskType::GetAttestationUid => Box::new(GetAttestationUidExecutor {}),
    }
}

fn handle_task_result(mut task: Task, result: TaskOkResult) {
    if result.retry_allowed && task.execute_count + 1 < task.max_retries {
        task.execute_count += 1;
        TASKS.with_borrow_mut(|tasks| {
            tasks.insert(ic_cdk::api::time() + task.retry_interval, task);
        });
    } else if !result.retry_allowed {
        debug("Task executed without needing retry.");
    } else {
        error("Task failed after max retries");
    }
}
