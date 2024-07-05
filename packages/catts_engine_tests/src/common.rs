use candid::{encode_one, Principal};
use pocket_ic::{PocketIc, WasmResult};
use std::fs;

use crate::types::RpcResult;

pub const CANISTER_WASM: &str = "../../target/wasm32-wasi/release/catts_engine.wasm.gz";

pub fn setup() -> (PocketIc, Principal) {
    let pic = PocketIc::new();
    let canister = pic.create_canister();
    pic.add_cycles(canister, 2_000_000_000_000); // 2T Cycles
    let wasm = fs::read(CANISTER_WASM).expect("Wasm file not found, run 'dfx build'.");
    let args = encode_one("test_key").unwrap();
    pic.install_canister(canister, wasm, args, None);
    (pic, canister)
}

pub fn update_call(
    pic: &PocketIc,
    canister: Principal,
    sender: Principal,
    method: &str,
    payload: Vec<u8>,
) -> Vec<u8> {
    let Ok(WasmResult::Reply(response)) = pic.update_call(canister, sender, method, payload) else {
        panic!("Expected reply");
    };
    response
}

pub fn query_call(
    pic: &PocketIc,
    canister: Principal,
    sender: Principal,
    method: &str,
    payload: Vec<u8>,
) -> Vec<u8> {
    let Ok(WasmResult::Reply(response)) = pic.query_call(canister, sender, method, payload) else {
        panic!("Expected reply");
    };
    response
}

pub fn should_be_401<T>(result: RpcResult<T>) {
    assert!(matches!(result, RpcResult::Err(_)));
    match result {
        RpcResult::Err(ref error) => {
            assert_eq!(error.code, 401);
        }
        _ => {
            unreachable!();
        }
    }
}
