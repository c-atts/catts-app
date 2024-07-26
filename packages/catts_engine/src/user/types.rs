use candid::{CandidType, Decode, Deserialize, Encode};
use ic_stable_structures::{storable::Bound, Storable};
use std::borrow::Cow;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum UserError {
    #[error("User already exists")]
    AlreadyExists,
    #[error("Invalid user principal")]
    InvalidPrincipal,
    #[error("User not found")]
    NotFound,
}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct User {
    pub eth_address: String,
}

impl User {
    pub fn new(address: &str) -> Self {
        Self {
            eth_address: address.to_string(),
        }
    }
}

impl Storable for User {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}
