use candid::Nat;
use ethers_core::{
    abi::{Contract, Function, FunctionExt},
    types::{U256, U64},
};
use ic_cdk::api::management_canister::ecdsa::EcdsaKeyId;

use crate::CANISTER_SETTINGS;

pub fn nat_to_u256(n: &Nat) -> U256 {
    let be_bytes = n.0.to_bytes_be();
    U256::from_big_endian(&be_bytes)
}

pub fn nat_to_u64(n: &Nat) -> U64 {
    let be_bytes = n.0.to_bytes_be();
    U64::from_big_endian(&be_bytes)
}

pub fn get_abi_function_by_name(abi: &Contract, function_name: &str) -> Function {
    match abi.functions_by_name(function_name).map(|v| &v[..]) {
        Ok([f]) => f.clone(),
        Ok(fs) => {
            panic!(
                "Found {} function overloads. Please pass one of the following: {}",
                fs.len(),
                fs.iter()
                    .map(|f| format!("{:?}", f.abi_signature()))
                    .collect::<Vec<_>>()
                    .join(", ")
            )
        }
        Err(_) => {
            panic!("Function {} not found in the ABI", function_name)
        }
    }
}

pub fn ecdsa_key_id() -> EcdsaKeyId {
    EcdsaKeyId {
        curve: ic_cdk::api::management_canister::ecdsa::EcdsaCurve::Secp256k1,
        name: CANISTER_SETTINGS.with(|settings| settings.borrow().ecdsa_key_id.clone()),
    }
}
