use crate::{
    eth::{EthAddress, EthAddressBytes},
    recipe::{self, RecipeId},
};
use candid::{CandidType, Decode, Encode, Nat};
use ic_cdk::api::time;
use ic_stable_structures::{storable::Bound, Storable};
use serde::{Deserialize, Serialize};
use std::borrow::Cow;
use thiserror::Error;

use super::state::generate_run_id;

#[derive(Error, Debug)]
pub enum RunError {
    #[error("Run not found")]
    NotFound,
    #[error("Recipe not found")]
    RecipeNotFound,
    #[error("Can't be cancelled: {0}")]
    CantBeCancelled(String),
}

pub type RunId = [u8; 12];

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
    pub created: u64,
    pub chain_id: u64,
    pub gas: Option<Nat>,
    pub base_fee_per_gas: Option<Nat>,
    pub max_priority_fee_per_gas: Option<Nat>,
    pub payment_transaction_hash: Option<String>,
    pub payment_verified_status: Option<PaymentVerifiedStatus>,
    pub attestation_transaction_hash: Option<String>,
    pub attestation_create_error: Option<String>,
    pub attestation_uid: Option<String>,
    pub is_cancelled: bool,
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
    pub fn new(
        recipe_id: &[u8; 12],
        chain_id: u64,
        creator: &EthAddress,
    ) -> Result<Self, RunError> {
        // A run must be created with a valid recipe
        recipe::get_by_id(recipe_id).map_err(|_| RunError::RecipeNotFound)?;

        let created = time();
        let id = generate_run_id(creator, created);

        let run = Self {
            id,
            recipe_id: *recipe_id,
            creator: creator.as_byte_array(),
            created,
            chain_id,
            gas: None,
            base_fee_per_gas: None,
            max_priority_fee_per_gas: None,
            payment_transaction_hash: None,
            payment_verified_status: None,
            attestation_transaction_hash: None,
            attestation_create_error: None,
            attestation_uid: None,
            is_cancelled: false,
        };

        Ok(run)
    }
}
