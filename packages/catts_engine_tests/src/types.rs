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

impl<T> RpcResult<T> {
    pub fn is_ok(&self) -> bool {
        matches!(self, RpcResult::Ok(_))
    }

    pub fn is_err(&self) -> bool {
        !self.is_ok()
    }

    pub fn unwrap_ok(&self) -> &T {
        match self {
            RpcResult::Ok(value) => value,
            RpcResult::Err(_) => panic!("called `RpcResult::unwrap_ok()` on an `Err` value"),
        }
    }

    pub fn unwrap_err(&self) -> &RpcError {
        match self {
            RpcResult::Ok(_) => panic!("called `RpcResult::unwrap_err()` on an `Ok` value"),
            RpcResult::Err(value) => value,
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone, CandidType)]
pub struct User {
    pub eth_address: String,
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
    pub description: Option<String>,
    pub keywords: Option<Vec<String>>,
    pub queries: Vec<RecipeQuery>,
    pub processor: String,
    pub schema: String,
    pub resolver: String,
    pub revokable: bool,
}
