use candid::{CandidType, Nat};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, CandidType, Clone)]
pub struct RpcError {
    pub code: u16,
    pub message: String,
    pub details: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, CandidType, Clone)]
pub enum RpcResult<T> {
    Ok(T),
    Err(RpcError),
}

pub type EthAddressBytes = [u8; 20];
pub type Uid = String;
pub type RecipeId = [u8; 12];

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, CandidType)]
pub enum RecipePublishState {
    Draft,
    Published,
    Unpublished,
}

#[derive(Serialize, Deserialize, Debug, Clone, CandidType)]
pub struct RecipeQuery {
    pub endpoint: String,
    pub query: String,
    pub variables: String,
}

#[derive(Serialize, Deserialize, Debug, Clone, CandidType)]
pub struct Recipe {
    pub id: RecipeId,
    pub name: String,
    pub display_name: Option<String>,
    pub creator: EthAddressBytes,
    pub created: u64,
    pub description: Option<String>,
    pub keywords: Option<Vec<String>>,
    pub queries: Vec<RecipeQuery>,
    pub processor: String,
    pub schema: Uid,
    pub resolver: String,
    pub revokable: bool,
    pub gas: Option<Nat>,
    pub publish_state: RecipePublishState,
}

#[derive(Serialize, Deserialize, Debug, CandidType)]
pub struct RecipeDetailsInput {
    pub name: String,
    pub display_name: Option<String>,
    pub description: Option<String>,
    pub keywords: Option<Vec<String>>,
    pub queries: Vec<RecipeQuery>,
    pub processor: String,
    pub schema: String,
    pub resolver: String,
    pub revokable: bool,
}
