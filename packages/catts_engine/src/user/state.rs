use super::User;
use crate::{eth::EthAddress, USERS};
use candid::Principal;
use ic_stable_structures::storable::Blob;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum UserCreateError {
    #[error("User already exists")]
    AlreadyExists,
    #[error("Invalid user principal")]
    InvalidPrincipal,
}

pub fn create(principal: Principal, eth_address: &EthAddress) -> Result<User, UserCreateError> {
    let principal_bytes: Blob<29> = principal.as_slice()[..29]
        .try_into()
        .map_err(|_| UserCreateError::InvalidPrincipal)?;

    USERS.with_borrow_mut(|users| {
        if users.contains_key(&principal_bytes) {
            return Err(UserCreateError::AlreadyExists);
        }
        let user = User::new(eth_address.as_str());
        users.insert(principal_bytes, user.clone());
        Ok(user)
    })
}

pub fn get_by_principal(principal: Principal) -> Option<User> {
    let principal_bytes: Blob<29> = principal.as_slice()[..29].try_into().ok()?;
    USERS.with_borrow(|users| users.get(&principal_bytes).clone())
}
