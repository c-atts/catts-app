use crate::{
    eth_address::{EthAddress, EthAddressBytes},
    recipe::RecipeId,
    RUNS,
};
use blake2::digest::{Update, VariableOutput};
use blake2::Blake2bVar;

use super::types::{PaymentVerifiedStatus, Run, RunError, RunId};

pub fn generate_run_id(creator: &EthAddress, created: u64) -> RunId {
    let mut hasher = Blake2bVar::new(12).unwrap();
    hasher.update(&creator.as_byte_array());
    hasher.update(&created.to_be_bytes());
    let mut buf = [0u8; 12];
    hasher.finalize_variable(&mut buf).unwrap();
    buf
}

pub fn save(run: Run) -> Run {
    RUNS.with_borrow_mut(|runs| {
        runs.insert((run.creator, run.id), run.clone());
    });
    run
}

pub fn cancel(address: &EthAddress, run_id: &RunId) -> Result<Run, RunError> {
    let mut run = get(address, run_id)?;

    // Runs can only be cancelled if they are not paid or if the payment is pending
    if run.payment_transaction_hash.is_some()
        || run.payment_verified_status == Some(PaymentVerifiedStatus::Verified)
    {
        return Err(RunError::CantBeCancelled("Run is already paid".to_string()));
    }

    run.is_cancelled = true;
    Ok(save(run))
}

pub fn get(creator: &EthAddress, run_id: &RunId) -> Result<Run, RunError> {
    RUNS.with_borrow(|runs| {
        runs.get(&(creator.as_byte_array(), *run_id))
            .ok_or(RunError::NotFound)
    })
}

pub fn get_by_address(address: &EthAddressBytes) -> Vec<Run> {
    RUNS.with(|runs| {
        runs.borrow()
            .range((*address, RecipeId::default())..)
            .map(|(_, run)| run)
            .collect()
    })
}

pub fn get_by_id(run_id: &RunId) -> Result<Run, RunError> {
    RUNS.with(|runs| {
        // Directly iterate through all entries if no direct lookup is possible
        runs.borrow()
            .iter()
            .find(|((_, rid), _)| rid == run_id)
            .map(|(_, run)| run.clone())
            .ok_or(RunError::NotFound)
    })
}

pub fn register_payment(
    address: &EthAddress,
    run_id: &RunId,
    transaction_hash: &str,
) -> Result<Run, RunError> {
    let mut run = get(address, run_id)?;

    if run.payment_transaction_hash.is_some() {
        return Err(RunError::AlreadyPaid);
    }

    run.payment_transaction_hash = Some(transaction_hash.to_string());
    run.payment_verified_status = Some(PaymentVerifiedStatus::Pending);
    Ok(save(run))
}
