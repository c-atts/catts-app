use ic_cdk::update;

use crate::evm_rpc::get_self_eth_address;

#[update]
async fn canister_eth_address() -> Result<String, String> {
    let canister_eth_address = get_self_eth_address().await;
    Ok(canister_eth_address)
}
