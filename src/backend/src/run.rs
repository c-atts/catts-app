use blake2::digest::{Update, VariableOutput};
use blake2::Blake2bVar;
use candid::{CandidType, Decode, Encode};
use ic_stable_structures::{storable::Bound, Storable};
use serde::{Deserialize, Serialize};
use std::{
    borrow::Cow,
    fmt::{self, Display, Formatter},
};

use crate::{
    eth::{EthAddress, EthAddressBytes},
    RUNS, RUNS_ORDER_INDEX,
};

const MAX_VALUE_SIZE: u32 = 1024;

pub type RunId = [u8; 12];

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
pub enum RunStatus {
    Created,
    Paid,
    Cancelled,
    Completed,
    Failed,
}

impl Display for RunStatus {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        write!(f, "{:?}", self)
    }
}

#[derive(Serialize, Deserialize, Debug, CandidType, Clone)]
pub struct Run {
    pub id: RunId,
    pub creator: EthAddressBytes,
    pub cost: u128,
    pub recipe_id: String,
    pub created: u64,
    pub status: RunStatus,
    pub run_attestation_uid: Option<String>,
    pub chain: Option<String>,
    pub attestations: Option<Vec<String>>,
    pub payment_transaction_hash: Option<String>,
}

impl Storable for Run {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: MAX_VALUE_SIZE,
        is_fixed_size: false,
    };
}

impl Run {
    pub fn new(address: &EthAddress, cost: u128, recipe_id: &str) -> Self {
        let created: u64 = ic_cdk::api::time();
        Self {
            id: Self::id(address, created),
            creator: address.as_byte_array(),
            cost,
            recipe_id: recipe_id.to_string(),
            created,
            status: RunStatus::Created,
            run_attestation_uid: None,
            chain: None,
            attestations: None,
            payment_transaction_hash: None,
        }
    }

    // hash of cretaor+created
    fn id(creator: &EthAddress, created: u64) -> RunId {
        let mut hasher = Blake2bVar::new(12).unwrap();
        hasher.update(&creator.as_byte_array());
        hasher.update(&created.to_be_bytes());
        let mut buf = [0u8; 12];
        hasher.finalize_variable(&mut buf).unwrap();
        buf
    }

    pub fn create(run: Run) {
        RUNS_ORDER_INDEX.with(|r| {
            r.borrow_mut().push(&run.id).unwrap();
        });
        RUNS.with(|r| {
            r.borrow_mut().insert((run.creator, run.id), run);
        });
    }

    pub fn update(run: Run) {
        RUNS.with(|r| {
            r.borrow_mut().insert((run.creator, run.id), run);
        });
    }

    pub fn cancel(address: &EthAddressBytes, run_id: &RunId) -> Result<Run, String> {
        RUNS.with(|r| {
            let address = *address;
            let run_id = *run_id;

            let key = (address, run_id);
            let mut runs = r.borrow_mut();
            if let Some(mut run) = runs.get(&key) {
                if run.creator != address {
                    return Err(String::from("Access denied"));
                }

                // if run.status != RunStatus::Pending {
                //     return Err(String::from("Run is not pending"));
                // }

                run.status = RunStatus::Cancelled;
                runs.insert(key, run.clone());

                Ok(run)
            } else {
                Err(String::from("Run not found"))
            }
        })
    }

    pub fn get(address: &EthAddressBytes, run_id: &RunId) -> Option<Run> {
        let address = *address;
        let run_id = *run_id;
        RUNS.with(|r| r.borrow().get(&(address, run_id)))
    }

    pub fn get_by_address(address: &EthAddressBytes) -> Vec<Run> {
        RUNS.with(|runs| {
            runs.borrow()
                .range((*address, [0; 12])..=(*address, [255; 12]))
                .map(|(_, run)| run)
                .collect()
        })
    }

    pub fn get_active(address: &EthAddressBytes) -> Vec<Run> {
        let runs = Self::get_by_address(address);
        runs.into_iter()
            .filter(|run| run.status == RunStatus::Created || run.status == RunStatus::Paid)
            .collect()
    }

    // pub fn get_by_id(run_id: &RunId) -> Option<Run> {
    //     RUNS.with(|r| {
    //         r.borrow()
    //             .range(([0; 20], *run_id)..=([255; 20], *run_id))
    //             .map(|(_, run)| run)
    //             .next()
    //     })
    // }
}