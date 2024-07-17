use super::User;
use crate::{eth::EthAddress, USERS, USER_ETH_ADDRESS_INDEX};
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

        USER_ETH_ADDRESS_INDEX.with_borrow_mut(|index| {
            index.insert(eth_address.as_byte_array(), principal_bytes);
        });

        Ok(user)
    })
}

pub fn get_by_principal(principal: Principal) -> Option<User> {
    let principal_bytes: Blob<29> = principal.as_slice()[..29].try_into().ok()?;
    USERS.with_borrow(|users| users.get(&principal_bytes).clone())
}

pub fn get_by_eth_address(eth_address: &EthAddress) -> Option<User> {
    let eth_address_bytes = eth_address.as_byte_array();
    USER_ETH_ADDRESS_INDEX.with_borrow(|index| {
        index.get(&eth_address_bytes).and_then(|principal_bytes| {
            USERS.with_borrow(|users| users.get(&principal_bytes).clone())
        })
    })
}
