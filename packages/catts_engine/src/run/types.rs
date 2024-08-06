use crate::{
    eth_address::EthAddress,
    json::{bytes_to_hex_string_value, nat_to_hex_string_value, ToJsonValue},
    recipe::{self, RecipeId},
    time::time,
};
use candid::{CandidType, Decode, Encode, Nat};
use ic_stable_structures::{storable::Bound, Storable};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
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
    #[error("Already paid")]
    AlreadyPaid,
}

pub type RunId = [u8; 12];

#[derive(Serialize, Deserialize, Debug, CandidType, Clone)]
pub struct Run {
    pub id: RunId,
    pub recipe_id: RecipeId,
    pub creator: String,
    pub created: u32,
    pub chain_id: u32,
    pub gas: Option<Nat>,
    pub base_fee_per_gas: Option<Nat>,
    pub max_priority_fee_per_gas: Option<Nat>,
    pub user_fee: Option<Nat>,
    pub payment_transaction_hash: Option<String>,
    pub payment_block_number: Option<Nat>,
    pub payment_log_index: Option<Nat>,
    pub attestation_transaction_hash: Option<String>,
    pub attestation_uid: Option<String>,
    pub is_cancelled: bool,
    pub error: Option<String>,
}

#[derive(PartialEq, PartialOrd)]
pub enum RunStatus {
    PaymentPending = 0,
    PaymentRegistered = 1,
    PaymentVerified = 2,
    AttestationCreated = 3,
    AttestationUidConfirmed = 4,
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

impl ToJsonValue for Run {
    fn to_json_value(&self) -> Value {
        let mut obj = serde_json::Map::new();

        obj.insert("id".to_string(), bytes_to_hex_string_value(&self.id));
        obj.insert(
            "recipe_id".to_string(),
            bytes_to_hex_string_value(&self.recipe_id),
        );
        obj.insert("creator".to_string(), json!(self.creator));
        obj.insert("created".to_string(), json!(self.created));
        obj.insert("chain_id".to_string(), json!(self.chain_id));
        if let Some(ref gas) = self.gas {
            obj.insert("gas".to_string(), nat_to_hex_string_value(gas));
        }
        if let Some(ref base_fee_per_gas) = self.base_fee_per_gas {
            obj.insert(
                "base_fee_per_gas".to_string(),
                nat_to_hex_string_value(base_fee_per_gas),
            );
        }
        if let Some(ref max_priority_fee_per_gas) = self.max_priority_fee_per_gas {
            obj.insert(
                "max_priority_fee_per_gas".to_string(),
                nat_to_hex_string_value(max_priority_fee_per_gas),
            );
        }
        if let Some(ref user_fee) = self.user_fee {
            obj.insert("user_fee".to_string(), nat_to_hex_string_value(user_fee));
        }
        if let Some(ref payment_transaction_hash) = self.payment_transaction_hash {
            obj.insert(
                "payment_transaction_hash".to_string(),
                Value::String(payment_transaction_hash.to_string()),
            );
        }
        if let Some(ref payment_block_number) = self.payment_block_number {
            obj.insert(
                "payment_block_number".to_string(),
                nat_to_hex_string_value(payment_block_number),
            );
        }
        if let Some(ref payment_log_index) = self.payment_log_index {
            obj.insert(
                "payment_log_index".to_string(),
                nat_to_hex_string_value(payment_log_index),
            );
        }
        if let Some(ref attestation_transaction_hash) = self.attestation_transaction_hash {
            obj.insert(
                "attestation_transaction_hash".to_string(),
                Value::String(attestation_transaction_hash.to_string()),
            );
        }
        if let Some(ref attestation_uid) = self.attestation_uid {
            obj.insert(
                "attestation_uid".to_string(),
                Value::String(attestation_uid.to_string()),
            );
        }
        obj.insert("is_cancelled".to_string(), json!(self.is_cancelled));
        if let Some(ref error) = self.error {
            obj.insert("error".to_string(), Value::String(error.to_string()));
        }

        Value::Object(obj)
    }
}

impl ToJsonValue for &Run {
    fn to_json_value(&self) -> Value {
        (*self).to_json_value()
    }
}

impl Run {
    pub fn new(
        recipe_id: &[u8; 12],
        chain_id: u32,
        creator: &EthAddress,
    ) -> Result<Self, RunError> {
        // A run must be created with a valid recipe
        recipe::get_by_id(recipe_id).map_err(|_| RunError::RecipeNotFound)?;

        let created = time();
        let id = generate_run_id(creator, created);

        let run = Self {
            id,
            recipe_id: *recipe_id,
            creator: creator.to_string(),
            created,
            chain_id,
            gas: None,
            base_fee_per_gas: None,
            max_priority_fee_per_gas: None,
            user_fee: None,
            payment_transaction_hash: None,
            payment_block_number: None,
            payment_log_index: None,
            attestation_transaction_hash: None,
            attestation_uid: None,
            is_cancelled: false,
            error: None,
        };

        Ok(run)
    }

    pub fn status(&self) -> RunStatus {
        if self.attestation_uid.is_some() {
            return RunStatus::AttestationUidConfirmed;
        }
        if self.attestation_transaction_hash.is_some() {
            return RunStatus::AttestationCreated;
        }
        if self.payment_log_index.is_some() {
            return RunStatus::PaymentVerified;
        }
        if self.payment_transaction_hash.is_some() {
            return RunStatus::PaymentRegistered;
        }
        RunStatus::PaymentPending
    }
}
