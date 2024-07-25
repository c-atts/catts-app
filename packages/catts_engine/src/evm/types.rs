use candid::Nat;
use ethers_core::types::Bytes;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
struct EthCallParams {
    to: String,
    data: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct JsonRpcSuccessResponse {
    pub jsonrpc: String,
    pub id: u64,
    pub result: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct JsonRpcErrorResponse {
    pub jsonrpc: String,
    pub id: u64,
    pub error: JsonRpcErrorDetail,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct JsonRpcErrorDetail {
    pub code: i32,
    pub message: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(untagged)]
pub enum JsonRpcResponse {
    Success(JsonRpcSuccessResponse),
    Error(JsonRpcErrorResponse),
}

#[derive(Debug)]
pub struct SignRequest {
    pub chain_id: Nat,
    pub to: String,
    pub gas: Nat,
    pub max_priority_fee_per_gas: Nat,
    pub value: Nat,
    pub nonce: Nat,
    pub data: Option<Bytes>,
}
