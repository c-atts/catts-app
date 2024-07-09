use candid::Nat;

use crate::CHAIN_CONFIGS;

use super::ChainConfig;

pub fn init_chain_configs() {
    CHAIN_CONFIGS.with_borrow_mut(|configs| {
        configs.insert(
            11155111, // Sepolia
            ChainConfig {
                chain_id: 11155111,
                base_fee: Nat::from(190_000_000_000u64),
                priority_fee: Nat::from(3_000_000_000u64),
                eth_usd_price: 2959.0,
                rpc_api_endpoint: "https://catts-evm-proxy-2.kristofer-977.workers.dev/eth-sepolia"
                    .to_string(),
                eas_contract: "0xC2679fBD37d54388Ce493F1DB75320D236e1815e".to_string(),
                payment_contract: "0xe498539Cad0E4325b88d6F6a1B89af7e4C8dF404".to_string(),
            },
        );
        configs.insert(
            10, // Optimism
            ChainConfig {
                chain_id: 10,
                base_fee: Nat::from(100_000_000u64),
                priority_fee: Nat::from(3_000_000u64),
                eth_usd_price: 2959.0,
                rpc_api_endpoint: "https://catts-evm-proxy-2.kristofer-977.workers.dev/opt-mainnet"
                    .to_string(),
                eas_contract: "0x4200000000000000000000000000000000000021".to_string(),
                payment_contract: "0x15a9a0f3bf24f9ff438f18f83ecc8b7cb2e15f9a".to_string(),
            },
        );
    });
}
