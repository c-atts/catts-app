use crate::{
    eth::{EthAddress, EthAddressBytes},
    recipe::RecipeId,
    RUNS,
};
use blake2::digest::{Update, VariableOutput};
use blake2::Blake2bVar;

use super::types::{PaymentVerifiedStatus, Run, RunError, RunId};

pub fn save(run: Run) -> Run {
    RUNS.with_borrow_mut(|r| {
        r.insert((run.creator, run.id), run.clone());
    });
    run
}

pub fn generate_run_id(creator: &EthAddress, created: u64) -> RunId {
    let mut hasher = Blake2bVar::new(12).unwrap();
    hasher.update(&creator.as_byte_array());
    hasher.update(&created.to_be_bytes());
    let mut buf = [0u8; 12];
    hasher.finalize_variable(&mut buf).unwrap();
    buf
}

pub fn cancel(address: &EthAddressBytes, run_id: &RunId) -> Result<Run, RunError> {
    RUNS.with(|r| {
        let address = *address;
        let run_id = *run_id;

        let key = (address, run_id);
        let mut runs = r.borrow_mut();
        if let Some(mut run) = runs.get(&key) {
            // Runs can only be cancelled if they are not paid or if the payment is pending
            let can_cancel = run.payment_transaction_hash.is_none()
                || run.payment_verified_status == Some(PaymentVerifiedStatus::Pending);
            if !can_cancel {
                return Err(RunError::TransactionHashAlreadyRegistered);
            }

            run.is_cancelled = true;
            runs.insert(key, run.clone());

            Ok(run)
        } else {
            Err(RunError::NotFound)
        }
    })
}

pub fn get(creator: &EthAddress, run_id: &RunId) -> Option<Run> {
    RUNS.with_borrow(|r| r.get(&(creator.as_byte_array(), *run_id)))
}

pub fn get_by_address(address: &EthAddressBytes) -> Vec<Run> {
    RUNS.with(|runs| {
        runs.borrow()
            .range((*address, RecipeId::default())..)
            .map(|(_, run)| run)
            .collect()
    })
}

pub fn get_by_id(run_id: &RunId) -> Option<Run> {
    RUNS.with(|r| {
        // Directly iterate through all entries if no direct lookup is possible
        r.borrow()
            .iter()
            .find(|((_, rid), _)| rid == run_id)
            .map(|(_, run)| run.clone()) // Clone the found run to return
    })
}

pub fn register_payment(
    address: &EthAddressBytes,
    run_id: &RunId,
    transaction_hash: &str,
) -> Result<Run, RunError> {
    RUNS.with(|r| {
        let address = *address;
        let run_id = *run_id;

        let key = (address, run_id);
        let mut runs = r.borrow_mut();
        if let Some(mut run) = runs.get(&key) {
            if run.payment_transaction_hash.is_some() {
                return Err(RunError::TransactionHashAlreadyRegistered);
            }

            run.payment_transaction_hash = Some(transaction_hash.to_string());
            run.payment_verified_status = Some(PaymentVerifiedStatus::Pending);
            runs.insert(key, run.clone());

            Ok(run)
        } else {
            Err(RunError::NotFound)
        }
    })
}
