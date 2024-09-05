use crate::{
    declarations::evm_rpc::{RpcApi, RpcService, RpcServices},
    CHAIN_CONFIGS,
};

use super::ChainConfig;

pub fn init_chain_configs() {
    let base_url = "https://catts-evm-proxy-2.kristofer-977.workers.dev";

    CHAIN_CONFIGS.with_borrow_mut(|configs| {
        configs.insert(
            11155111, // Sepolia
            ChainConfig {
                chain_id: 11155111,
                name: "Sepolia".to_string(),
                eth_usd_price: "0x123".to_string(),
                eas_contract: "0xC2679fBD37d54388Ce493F1DB75320D236e1815e".to_string(),
                payment_contract: "0xe498539Cad0E4325b88d6F6a1B89af7e4C8dF404".to_string(),
                rpc_services: RpcServices::Custom {
                    chainId: 11155111,
                    services: vec![RpcApi {
                        url: format!("{}/{}", base_url, "eth-sepolia"),
                        headers: None,
                    }],
                },
                default_rpc_service: RpcService::Custom(RpcApi {
                    url: format!("{}/{}", base_url, "eth-sepolia"),
                    headers: None,
                }),
            },
        );
        configs.insert(
            10, // Optimism
            ChainConfig {
                chain_id: 10,
                name: "Optimism".to_string(),
                eth_usd_price: "0x123".to_string(),
                eas_contract: "0x4200000000000000000000000000000000000021".to_string(),
                payment_contract: "0x15a9a0f3bf24f9ff438f18f83ecc8b7cb2e15f9a".to_string(),
                rpc_services: RpcServices::Custom {
                    chainId: 10,
                    services: vec![RpcApi {
                        url: format!("{}/{}", base_url, "opt-mainnet"),
                        headers: None,
                    }],
                },
                default_rpc_service: RpcService::Custom(RpcApi {
                    url: format!("{}/{}", base_url, "opt-mainnet"),
                    headers: None,
                }),
            },
        );
        configs.insert(
            8453, // Base
            ChainConfig {
                chain_id: 8453,
                name: "Base".to_string(),
                eth_usd_price: "0x123".to_string(),
                eas_contract: "0x4200000000000000000000000000000000000021".to_string(),
                payment_contract: "0x839ADFdFd2B038C3e4429abe54ac4DBB620a0BD1".to_string(),
                rpc_services: RpcServices::Custom {
                    chainId: 8453,
                    services: vec![RpcApi {
                        url: format!("{}/{}", base_url, "base-mainnet"),
                        headers: None,
                    }],
                },
                default_rpc_service: RpcService::Custom(RpcApi {
                    url: format!("{}/{}", base_url, "base-mainnet"),
                    headers: None,
                }),
            },
        );
        configs.insert(
            42161, // Arbitrum One
            ChainConfig {
                chain_id: 42161,
                name: "Arbitrum One".to_string(),
                eth_usd_price: "0x123".to_string(),
                eas_contract: "0xbD75f629A22Dc1ceD33dDA0b68c546A1c035c458".to_string(),
                payment_contract: "0x5601FE396f901442b1EAcAE5844431B7A4e2587D".to_string(),
                rpc_services: RpcServices::Custom {
                    chainId: 42161,
                    services: vec![RpcApi {
                        url: format!("{}/{}", base_url, "arb-mainnet"),
                        headers: None,
                    }],
                },
                default_rpc_service: RpcService::Custom(RpcApi {
                    url: format!("{}/{}", base_url, "arb-mainnet"),
                    headers: None,
                }),
            },
        );
    });
}
