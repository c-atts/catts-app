use candid::{decode_one, encode_one, CandidType, Principal};
use pocket_ic::{PocketIc, WasmResult};
use serde::{Deserialize, Serialize};
use std::{fs, time::Duration};

use crate::types::{RpcError, RpcResult};

pub const CATTS_ENGINE_WASM: &str = "../../target/wasm32-wasi/release/catts_engine.wasm.gz";
pub const IC_SIWE_WASM: &str = "../ic_siwe_provider/ic_siwe_provider.wasm.gz";

#[derive(CandidType, Debug, Clone, PartialEq, Deserialize)]
pub enum RuntimeFeature {
    IncludeUriInSeed,
    DisableEthToPrincipalMapping,
    DisablePrincipalToEthMapping,
}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct SettingsInput {
    pub domain: String,
    pub uri: String,
    pub salt: String,
    pub chain_id: Option<u32>,
    pub scheme: Option<String>,
    pub statement: Option<String>,
    pub sign_in_expires_in: Option<u64>,
    pub session_expires_in: Option<u64>,
    pub targets: Option<Vec<String>>,
    pub runtime_features: Option<Vec<RuntimeFeature>>,
}

#[derive(Serialize, Deserialize, CandidType)]
struct CattsEngineSettings {
    ecdsa_key_id: String,
    siwe_provider_canister: String,
    evm_rpc_canister: String,
}

pub fn setup() -> (PocketIc, Principal, Principal) {
    let ic = PocketIc::new();

    // Install ic-siwe
    let ic_siwe_canister = ic.create_canister();
    ic.add_cycles(ic_siwe_canister, 2_000_000_000_000); // 2T Cycles
    let ic_siwe_wasm = fs::read(IC_SIWE_WASM).expect("IC_SIWE_WASM not found");
    let ic_siwe_settings = SettingsInput {
        domain: "127.0.0.1".to_string(),
        uri: "http://127.0.0.1".to_string(),
        salt: "dummy-salt".to_string(),
        chain_id: None,
        scheme: Some("http".to_string()),
        statement: Some("Login to the app".to_string()),
        sign_in_expires_in: Some(Duration::from_secs(3).as_nanos() as u64), // 3 seconds
        session_expires_in: Some(Duration::from_secs(60 * 60 * 24 * 7).as_nanos() as u64), // 1 week
        targets: None,
        runtime_features: Some(vec![RuntimeFeature::IncludeUriInSeed]),
    };
    let args = encode_one(ic_siwe_settings).unwrap();
    ic.install_canister(ic_siwe_canister, ic_siwe_wasm, args, None);

    // Install catts_engine
    let catts_engine_canister = ic.create_canister();
    ic.add_cycles(catts_engine_canister, 2_000_000_000_000); // 2T Cycles
    let catts_engine_wasm = fs::read(CATTS_ENGINE_WASM).expect("CATTS_ENGINE_WASM not found");
    let catts_engine_settings = CattsEngineSettings {
        ecdsa_key_id: "test_key".to_string(),
        siwe_provider_canister: ic_siwe_canister.to_string(),
        evm_rpc_canister: "not used yet".to_string(),
    };
    let args = encode_one(catts_engine_settings).unwrap();
    ic.install_canister(catts_engine_canister, catts_engine_wasm, args, None);

    // Fast forward in time to allow the ic_siwe_provider_canister to be fully installed.
    for _ in 0..5 {
        ic.tick();
    }

    (ic, ic_siwe_canister, catts_engine_canister)
}

pub fn update<T: CandidType + for<'de> Deserialize<'de>>(
    ic: &PocketIc,
    canister: Principal,
    sender: Principal,
    method: &str,
    args: Vec<u8>,
) -> Result<T, String> {
    match ic.update_call(canister, sender, method, args) {
        Ok(WasmResult::Reply(data)) => decode_one(&data).unwrap(),
        Ok(WasmResult::Reject(error_message)) => Err(error_message.to_string()),
        Err(user_error) => Err(user_error.to_string()),
    }
}

pub fn catts_update<T: CandidType + for<'de> Deserialize<'de>>(
    ic: &PocketIc,
    canister: Principal,
    sender: Principal,
    method: &str,
    args: Vec<u8>,
) -> RpcResult<T> {
    match ic.update_call(canister, sender, method, args) {
        Ok(WasmResult::Reply(data)) => decode_one(&data).unwrap(),
        Ok(WasmResult::Reject(error_message)) => RpcResult::Err(RpcError {
            code: 500,
            message: error_message.to_string(),
            details: None,
        }),
        Err(err) => RpcResult::Err(RpcError {
            code: 500,
            message: err.to_string(),
            details: None,
        }),
    }
}

pub fn query<T: CandidType + for<'de> Deserialize<'de>>(
    ic: &PocketIc,
    canister: Principal,
    sender: Principal,
    method: &str,
    args: Vec<u8>,
) -> Result<T, String> {
    match ic.query_call(canister, sender, method, args) {
        Ok(WasmResult::Reply(data)) => decode_one(&data).unwrap(),
        Ok(WasmResult::Reject(error_message)) => Err(error_message.to_string()),
        Err(user_error) => Err(user_error.to_string()),
    }
}

pub fn catts_query<T: CandidType + for<'de> Deserialize<'de>>(
    ic: &PocketIc,
    canister: Principal,
    sender: Principal,
    method: &str,
    args: Vec<u8>,
) -> RpcResult<T> {
    match ic.query_call(canister, sender, method, args) {
        Ok(WasmResult::Reply(data)) => decode_one(&data).unwrap(),
        Ok(WasmResult::Reject(error_message)) => RpcResult::Err(RpcError {
            code: 500,
            message: error_message.to_string(),
            details: None,
        }),
        Err(err) => RpcResult::Err(RpcError {
            code: 500,
            message: err.to_string(),
            details: None,
        }),
    }
}

#[macro_export]
macro_rules! assert_starts_with {
    ($left:expr, $right:expr $(,)?) => {{
        let left_val = $left;
        let right_val = $right;
        if !left_val.starts_with(&right_val) {
            panic!(
                "assertion failed: `(left starts with right)`\n  left: `{}`,\n right: `{}`",
                left_val, right_val
            );
        }
    }};
}
