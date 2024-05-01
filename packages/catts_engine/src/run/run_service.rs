use crate::{
    eth::{EthAddress, EthAddressBytes},
    recipe::{Recipe, RecipeId},
    RUNS,
};
use blake2::digest::{Update, VariableOutput};
use blake2::Blake2bVar;
use candid::{CandidType, Decode, Encode};
use ic_stable_structures::{storable::Bound, Storable};
use serde::{Deserialize, Serialize};
use std::borrow::Cow;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum RunError {
    #[error("Run not found")]
    NotFound,
    #[error("Run have already been paid")]
    AlreadyPaid,
}

pub type RunId = [u8; 12];
pub type Timestamp = u64;

pub fn vec_to_run_id(bytes: Vec<u8>) -> Result<[u8; 12], String> {
    if bytes.len() == 12 {
        let mut array = [0u8; 12];
        array.copy_from_slice(&bytes[0..12]);
        Ok(array)
    } else {
        Err("Vector should have 12 elements".to_string())
    }
}

#[derive(Serialize, Deserialize, Debug, CandidType, PartialEq, Clone)]
pub enum PaymentVerifiedStatus {
    Pending,
    Verified,
    VerificationFailed,
}

#[derive(Serialize, Deserialize, Debug, CandidType, Clone)]
pub struct Run {
    pub id: RunId,
    pub recipe_id: RecipeId,
    pub creator: EthAddressBytes,
    pub created: Timestamp,
    pub cost: u128,
    pub is_cancelled: bool,
    pub payment_transaction_hash: Option<String>,
    pub payment_verified_status: Option<PaymentVerifiedStatus>,
    pub attestation_transaction_hash: Option<String>,
    pub attestation_create_error: Option<String>,
    pub attestation_uid: Option<String>,
    pub attestation_chain: Option<String>,
}

impl Storable for Run {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Run {
    pub fn new(address: &EthAddress, cost: u128, recipe_id: &[u8; 12]) -> Result<Self, RunError> {
        Recipe::get_by_id(recipe_id).ok_or(RunError::NotFound)?;

        let created = ic_cdk::api::time();
        let id = Self::id(address, created);

        let run = Self {
            id,
            recipe_id: *recipe_id,
            creator: address.as_byte_array(),
            created,
            cost,
            is_cancelled: false,
            payment_transaction_hash: None,
            payment_verified_status: None,
            attestation_transaction_hash: None,
            attestation_create_error: None,
            attestation_uid: None,
            attestation_chain: None,
        };

        RUNS.with_borrow_mut(|r| {
            r.insert((address.as_byte_array(), id), run.clone());
        });

        Ok(run)
    }

    // hash of creator+created
    fn id(creator: &EthAddress, created: u64) -> RunId {
        let mut hasher = Blake2bVar::new(12).unwrap();
        hasher.update(&creator.as_byte_array());
        hasher.update(&created.to_be_bytes());
        let mut buf = [0u8; 12];
        hasher.finalize_variable(&mut buf).unwrap();
        buf
    }

    pub fn update(run: &Run) {
        RUNS.with(|r| {
            let run = run.clone();
            r.borrow_mut().insert((run.creator, run.id), run);
        });
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
                    return Err(RunError::AlreadyPaid);
                }

                run.is_cancelled = true;
                runs.insert(key, run.clone());

                Ok(run)
            } else {
                Err(RunError::NotFound)
            }
        })
    }

    pub fn get(address: &EthAddressBytes, run_id: &RunId) -> Option<Run> {
        RUNS.with_borrow(|r| r.get(&(*address, *run_id)))
    }

    pub fn get_by_address(address: &EthAddressBytes) -> Vec<Run> {
        RUNS.with(|runs| {
            runs.borrow()
                .range((*address, RecipeId::default())..)
                .map(|(_, run)| run)
                .collect()
        })
    }

    // pub fn get_by_id(run_id: &RunId) -> Option<Run> {
    //     RUNS.with(|r| {
    //         r.borrow()
    //             .range(([0; 20], *run_id)..=([255; 20], *run_id))
    //             .map(|(_, run)| run)
    //             .next()
    //     })
    // }

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
                    return Err(RunError::AlreadyPaid);
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
}
