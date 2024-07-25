use std::borrow::Cow;

use candid::{CandidType, Decode, Deserialize, Encode};
use ic_stable_structures::{storable::Bound, Storable};

use crate::declarations::evm_rpc::{RpcService, RpcServices};

#[derive(CandidType, Clone, Deserialize)]
pub struct ChainConfig {
    pub chain_id: u64,
    pub eth_usd_price: f64,
    pub rpc_api_endpoint: String,
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
