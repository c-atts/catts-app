use std::collections::HashMap;

use crate::logger::{error, info};
use crate::{chain_config, ETH_DEFAULT_CALL_CYCLES_128, ETH_FEE_HISTORY_BLOCK_COUNT, EVM_RPC};
use evm_rpc_canister_types::{
    BlockTag, EthMainnetService, EthSepoliaService, FeeHistoryArgs, FeeHistoryResult,
    L2MainnetService, MultiFeeHistoryResult, RpcServices,
};
use lazy_static::lazy_static;
use num_bigint::BigUint;

lazy_static! {
    static ref RPC_SERVICES: HashMap<&'static u64, RpcServices> = {
        let mut m = HashMap::new();
        m.insert(
            &1u64,
            RpcServices::EthMainnet(Some(vec![EthMainnetService::Ankr])),
        );
        m.insert(
            &11155111u64,
            RpcServices::EthSepolia(Some(vec![EthSepoliaService::Ankr])),
        );
        m.insert(
            &10u64,
            RpcServices::Optimism(Some(vec![L2MainnetService::Ankr])),
        );
        m.insert(
            &8453u64,
            RpcServices::BaseMainnet(Some(vec![L2MainnetService::Ankr])),
        );
        m.insert(
            &42161u64,
            RpcServices::ArbitrumOne(Some(vec![L2MainnetService::Ankr])),
        );
        m
    };
}

pub fn get_rpc_services_for_chain(chain_id: u64) -> Option<RpcServices> {
    RPC_SERVICES.get(&chain_id).cloned()
}

pub fn update_base_fee_per_gas(chain_id: u64) {
    ic_cdk::spawn(async move {
        let rpc_services = match get_rpc_services_for_chain(chain_id) {
            Some(rpc_services) => rpc_services,
            None => {
                error(format!("RpcServices not found for chain: {}", chain_id).as_str());
                return;
            }
        };

        let result = EVM_RPC
            .eth_fee_history(
                rpc_services,
                None,
                FeeHistoryArgs {
                    blockCount: ETH_FEE_HISTORY_BLOCK_COUNT.into(),
                    newestBlock: BlockTag::Latest,
                    rewardPercentiles: None,
                },
                ETH_DEFAULT_CALL_CYCLES_128,
            )
            .await;

        match result {
            Ok((MultiFeeHistoryResult::Consistent(FeeHistoryResult::Ok(fee_history)),)) => {
                let fee_history = match fee_history {
                    Some(fee_history) => fee_history,
                    None => {
                        error("eth_feeHistory did not return any results");
                        return;
                    }
                };

                let mut sum: BigUint = 0u8.into();
                for fee in fee_history.baseFeePerGas.iter() {
                    sum += fee.0.clone();
                }
                let avg = sum / fee_history.baseFeePerGas.len();
                let mut chain_config = match chain_config::get(chain_id) {
                    Some(chain_config) => chain_config,
                    None => {
                        error("ChainConfig not found for chain");
                        return;
                    }
                };
                info(&format!(
                    "Updating base fee for chain {} to: {:?}",
                    chain_id, avg
                ));
                chain_config.base_fee_per_gas = avg.into();
                chain_config::set(chain_config);
            }
            Ok((inconsistent,)) => {
                error(&format!(
                    "Fee history result is inconsistent: {:?}",
                    inconsistent
                ));
            }
            Err(err) => {
                error(&format!("Error fetching fee history: {:?}", err));
            }
        }
    });
}
