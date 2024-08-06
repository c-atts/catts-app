use super::types::{Run, RunError, RunId};
use crate::change_log::ChangeLogTypeName;
use crate::eth_address::EthAddress;
use crate::{change_log, RUNS};
use blake2::digest::{Update, VariableOutput};
use blake2::Blake2bVar;
use candid::Nat;

pub fn generate_run_id(creator: &EthAddress, created: u32) -> RunId {
    let mut hasher = Blake2bVar::new(12).unwrap();
    hasher.update(&creator.as_byte_array());
    hasher.update(&created.to_be_bytes());
    let mut buf = [0u8; 12];
    hasher.finalize_variable(&mut buf).unwrap();
    buf
}

pub fn create(run: Run) -> Run {
    RUNS.with_borrow_mut(|runs| {
        runs.insert(run.id, run.clone());
    });
    change_log::create(ChangeLogTypeName::Run, run.id, &run).unwrap();
    run
}

pub fn update(run: Run) -> Result<Run, RunError> {
    let old_run = get(&run.id)?;
    RUNS.with_borrow_mut(|runs| {
        runs.insert(run.id, run.clone());
    });
    change_log::update(ChangeLogTypeName::Run, run.id, &old_run, &run).unwrap();
    Ok(run)
}

pub fn cancel(run_id: &RunId) -> Result<Run, RunError> {
    let mut run = get(run_id)?;

    // Runs can only be cancelled if they are not paid yet
    if run.payment_transaction_hash.is_some() {
        return Err(RunError::CantBeCancelled("Run is already paid".to_string()));
    }

    run.is_cancelled = true;

    update(run)
}

pub fn get(run_id: &RunId) -> Result<Run, RunError> {
    RUNS.with_borrow(|runs| runs.get(run_id).ok_or(RunError::NotFound))
}

pub fn register_payment(
    run_id: &RunId,
    transaction_hash: &str,
    block_to_process: u128,
) -> Result<Run, RunError> {
    let mut run = get(run_id)?;

    if run.payment_transaction_hash.is_some() {
        return Err(RunError::AlreadyPaid);
    }

    run.payment_transaction_hash = Some(transaction_hash.to_string());
    run.payment_block_number = Some(Nat::from(block_to_process));

    update(run)
}
