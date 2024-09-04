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
                eth_usd_price: "0x123".to_string(),
                eas_contract: "0xC2679fBD37d54388Ce493F1DB75320D236e1815e".to_string(),
                payment_contract: "0xe498539Cad0E4325b88d6F6a1B89af7e4C8dF404".to_string(),
                rpc_services: RpcServices::EthSepolia(Some(vec![EthSepoliaService::BlockPi])),
                default_rpc_service: RpcService::EthSepolia(EthSepoliaService::BlockPi),
            },
        );
        configs.insert(
            10, // Optimism
            ChainConfig {
                chain_id: 10,
                eth_usd_price: "0x123".to_string(),
                eas_contract: "0x4200000000000000000000000000000000000021".to_string(),
                payment_contract: "0x15a9a0f3bf24f9ff438f18f83ecc8b7cb2e15f9a".to_string(),
                rpc_services: RpcServices::OptimismMainnet(Some(vec![L2MainnetService::BlockPi])),
                default_rpc_service: RpcService::OptimismMainnet(L2MainnetService::BlockPi),
            },
        );
        configs.insert(
            8453, // Base
            ChainConfig {
                chain_id: 8453,
                eth_usd_price: "0x123".to_string(),
                eas_contract: "0x4200000000000000000000000000000000000021".to_string(),
                payment_contract: "0x839ADFdFd2B038C3e4429abe54ac4DBB620a0BD1".to_string(),
                rpc_services: RpcServices::BaseMainnet(Some(vec![L2MainnetService::BlockPi])),
                default_rpc_service: RpcService::BaseMainnet(L2MainnetService::BlockPi),
            },
        );
        configs.insert(
            42161, // Arbitrum One
            ChainConfig {
                chain_id: 42161,
                eth_usd_price: "0x123".to_string(),
                eas_contract: "0xbD75f629A22Dc1ceD33dDA0b68c546A1c035c458".to_string(),
                payment_contract: "0x5601FE396f901442b1EAcAE5844431B7A4e2587D".to_string(),
                rpc_services: RpcServices::ArbitrumOne(Some(vec![L2MainnetService::BlockPi])),
                default_rpc_service: RpcService::ArbitrumOne(L2MainnetService::BlockPi),
            },
        );
    });
}
