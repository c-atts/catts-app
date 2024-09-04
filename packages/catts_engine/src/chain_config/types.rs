use candid::{CandidType, Deserialize};
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
    pub name: String,
    pub eth_usd_price: String,
    pub eas_contract: String,
    pub payment_contract: String,
    pub rpc_services: RpcServices,
    pub default_rpc_service: RpcService,
}
