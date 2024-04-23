use dotenv::dotenv;
use ic_cdk_bindgen::{Builder, Config};
use std::env;
use std::path::PathBuf;

fn main() {
    dotenv().ok();

    let manifest_dir =
        PathBuf::from(env::var("CARGO_MANIFEST_DIR").expect("Cannot find manifest dir"));

    let ic_siwe_provider_did_path = manifest_dir.join("../ic_siwe_provider/ic_siwe_provider.did");
    let evm_rpc_did_path = manifest_dir.join("../evm_rpc/evm_rpc.did");

    let ic_siwe_provider_did_str = ic_siwe_provider_did_path.to_str().expect("Path invalid");
    let evm_rpc_did_str = evm_rpc_did_path.to_str().expect("Path invalid");

    env::set_var(
        "CANISTER_CANDID_PATH_IC_SIWE_PROVIDER",
        ic_siwe_provider_did_str,
    );
    env::set_var("CANISTER_CANDID_PATH_EVM_RPC", evm_rpc_did_str);

    let mut builder = Builder::new();

    // ic_siwe_provider
    let mut ic_siwe_provider = Config::new("ic_siwe_provider");
    ic_siwe_provider
        .binding
        .set_type_attributes("#[derive(Debug, CandidType, Deserialize)]".into());
    builder.add(ic_siwe_provider);

    // evm_rpc
    let mut evm_rpc = Config::new("evm_rpc");
    evm_rpc
        .binding
        .set_type_attributes("#[derive(Debug, CandidType, Deserialize)]".into());
    builder.add(evm_rpc);

    builder.build(Some(manifest_dir.join("src/declarations")));
}
