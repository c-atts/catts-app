use crate::{
    declarations::evm_rpc::{EthSepoliaService, L2MainnetService, RpcService, RpcServices},
    CHAIN_CONFIGS,
};

use super::ChainConfig;

pub fn init_chain_configs() {
    CHAIN_CONFIGS.with_borrow_mut(|configs| {
        configs.insert(
            11155111, // Sepolia
            ChainConfig {
                chain_id: 11155111,
                eth_usd_price: 2959.0,
                rpc_api_endpoint: "https://catts-evm-proxy-2.kristofer-977.workers.dev/eth-sepolia"
                    .to_string(),
                eas_contract: "0xC2679fBD37d54388Ce493F1DB75320D236e1815e".to_string(),
                payment_contract: "0xe498539Cad0E4325b88d6F6a1B89af7e4C8dF404".to_string(),
                rpc_services: RpcServices::EthSepolia(Some(vec![
                    EthSepoliaService::Ankr,
                    EthSepoliaService::BlockPi,
                ])),
                default_rpc_service: RpcService::EthSepolia(EthSepoliaService::BlockPi),
            },
        );
        configs.insert(
            10, // Optimism
            ChainConfig {
                chain_id: 10,
                eth_usd_price: 2959.0,
                rpc_api_endpoint: "https://catts-evm-proxy-2.kristofer-977.workers.dev/opt-mainnet"
                    .to_string(),
                eas_contract: "0x4200000000000000000000000000000000000021".to_string(),
                payment_contract: "0x15a9a0f3bf24f9ff438f18f83ecc8b7cb2e15f9a".to_string(),
                rpc_services: RpcServices::OptimismMainnet(Some(vec![
                    L2MainnetService::Ankr,
                    L2MainnetService::BlockPi,
                ])),
                default_rpc_service: RpcService::OptimismMainnet(L2MainnetService::BlockPi),
            },
        );
    });
}
