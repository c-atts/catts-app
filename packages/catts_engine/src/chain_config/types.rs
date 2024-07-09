use std::borrow::Cow;

use candid::{CandidType, Decode, Encode, Nat};
use ic_stable_structures::{storable::Bound, Storable};
use serde::{Deserialize, Serialize};

use crate::declarations::evm_rpc::{RpcApi, RpcServices};

#[derive(Serialize, Deserialize, Debug, CandidType, Clone)]
pub struct ChainConfig {
    pub chain_id: u64,
    pub base_fee: Nat,
    pub priority_fee: Nat,
    pub eth_usd_price: f64,
    pub rpc_api_endpoint: String,
    pub eas_contract: String,
    pub payment_contract: String,
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

impl ChainConfig {
    pub fn eth_service(&self) -> RpcServices {
        let rpc_api: RpcApi = RpcApi {
            url: self.rpc_api_endpoint.clone(),
            headers: None,
        };
        RpcServices::Custom {
            chainId: self.chain_id,
            services: vec![rpc_api],
        }
    }
}
