use candid::{encode_one, CandidType, Principal};
use pocket_ic::PocketIc;
use serde::{Deserialize, Serialize};
use std::fs;

pub const CANISTER_WASM: &str = "../../target/wasm32-wasi/release/catts_engine.wasm.gz";

#[derive(Serialize, Deserialize, Debug, CandidType, Clone)]
pub enum Result<T> {
    Ok(T),
    Err(String),
}

pub fn setup() -> (PocketIc, Principal) {
    let pic = PocketIc::new();
    let canister = pic.create_canister();
    pic.add_cycles(canister, 2_000_000_000_000); // 2T Cycles
    let wasm = fs::read(CANISTER_WASM).expect("Wasm file not found, run 'dfx build'.");
    let args = encode_one("test_key").unwrap();
    pic.install_canister(canister, wasm, args, None);
    (pic, canister)
}
