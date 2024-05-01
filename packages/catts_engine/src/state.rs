use std::borrow::Cow;

use candid::{CandidType, Decode, Deserialize, Encode, Nat};
use ic_stable_structures::{storable::Bound, Storable};

const MAX_VALUE_SIZE: u32 = 4;

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct State {
    pub eth_payments_latest_block: Nat,
}

impl State {
    pub fn new() -> Self {
        Self {
            eth_payments_latest_block: Nat::from(0u8),
        }
    }
}

impl Storable for State {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: MAX_VALUE_SIZE,
        is_fixed_size: false,
    };
}
