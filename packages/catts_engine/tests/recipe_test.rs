use candid::{decode_one, Principal};
use catts_engine::Recipe;
use pocket_ic::{PocketIc, WasmResult};
use std::fs;

const CANISTER_WASM: &str = "../../target/wasm32-wasi/release/catts_engine.wasm.gz";

fn setup() -> (PocketIc, Principal) {
    let pic = PocketIc::new();
    let canister = pic.create_canister();
    pic.add_cycles(canister, 2_000_000_000_000); // 2T Cycles
    let wasm = fs::read(CANISTER_WASM).expect("Wasm file not found, run 'dfx build'.");
    pic.install_canister(canister, wasm, vec![], None);
    (pic, canister)
}

#[test]
fn test_recipe_list() {
    let (pic, catts) = setup();

    let Ok(WasmResult::Reply(response)) =
        pic.query_call(catts, Principal::anonymous(), "recipe_list", vec![])
    else {
        panic!("Expected reply");
    };

    let result: Vec<Recipe> = decode_one(&response).unwrap();

    // do some assertions
}
