use crate::{
    logger,
    run::tasks::{
        create_attestation::CreateAttestationExecutor,
        get_attestation_uid::GetAttestationUidExecutor, register_payment::RegisterPaymentExecutor,
    },
    TASKS,
};
use candid::{CandidType, Decode, Encode};
use ic_stable_structures::{storable::Bound, Storable};
use serde::Deserialize;
use std::{borrow::Cow, future::Future, pin::Pin};
use thiserror::Error;

pub type Timestamp = u64;

#[derive(Error, Debug)]
pub enum TaskError {
    #[error("{0}")]
    Cancel(String),

    #[error("{0}")]
    Retry(String),
}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub enum TaskType {
    ProcessRunPayment,
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

pub trait TaskExecutor {
    fn execute(&self, task: Task) -> Pin<Box<dyn Future<Output = Result<(), TaskError>> + Send>>;
}

fn get_executor_for_task(task: &Task) -> Box<dyn TaskExecutor> {
    match task.task_type {
        TaskType::ProcessRunPayment => Box::new(RegisterPaymentExecutor {}),
        TaskType::CreateAttestation => Box::new(CreateAttestationExecutor {}),
        TaskType::GetAttestationUid => Box::new(GetAttestationUidExecutor {}),
    }
}

pub fn add_task(run_time: Timestamp, task: Task) {
    // If the task is scheduled to run in the past, execute it immediately
    if run_time < ic_cdk::api::time() {
        execute_task(task);
        return;
    }
    TASKS.with_borrow_mut(|tasks| {
        tasks.insert(run_time, task);
    });
}

pub fn execute_tasks() {
    let mut tasks_to_process: Vec<Task> = Vec::new();
    let current_time = ic_cdk::api::time();

    TASKS.with_borrow_mut(|tasks| {
        while let Some((run_time, _)) = tasks.first_key_value() {
            if run_time > current_time {
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

fn execute_task(mut task: Task) {
    logger::debug(
        format!(
            "Executing task {:?}, retry {:?}",
            task.task_type,
            task.execute_count + 1
        )
        .as_str(),
    );
    ic_cdk::spawn(async move {
        match get_executor_for_task(&task).execute(task.clone()).await {
            Ok(_) => {
                logger::debug(format!("Task {:?} executed successfully", task.task_type).as_str())
            }
            Err(e) => match e {
                TaskError::Retry(reason) => {
                    if task.execute_count + 1 < task.max_retries {
                        task.execute_count += 1;
                        TASKS.with_borrow_mut(|tasks| {
                            tasks.insert(ic_cdk::api::time() + task.retry_interval, task);
                        });
                        logger::debug(format!("Task failed, retrying: {}", reason).as_str());
                    } else {
                        logger::debug(
                            format!("Task failed, max retries reached: {}", reason).as_str(),
                        );
                    }
                }
                TaskError::Cancel(reason) => {
                    logger::debug(format!("Task failed, cancelling: {}", reason).as_str());
                }
            },
        }
    });
}
