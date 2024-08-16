use std::borrow::Cow;

use candid::{CandidType, Decode, Deserialize, Encode};
use ic_stable_structures::{storable::Bound, Storable};
use thiserror::Error;

use crate::declarations::evm_rpc::{RpcService, RpcServices};

#[derive(Error, Debug)]
pub enum ChainConfigError {
    #[error("Chain config not found")]
    NotFound,
}

#[derive(CandidType, Clone, Deserialize)]
pub struct ChainConfig {
    pub chain_id: u32,
    pub eth_usd_price: String,
    pub eas_contract: String,
    pub payment_contract: String,
    pub rpc_services: RpcServices,
    pub default_rpc_service: RpcService,
}

impl Storable for ChainConfig {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}
