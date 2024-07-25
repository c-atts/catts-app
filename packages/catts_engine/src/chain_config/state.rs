use super::ChainConfig;
use crate::CHAIN_CONFIGS;

pub fn get(chain_id: u64) -> Option<ChainConfig> {
    CHAIN_CONFIGS.with_borrow(|configs| configs.get(&chain_id))
}

pub fn _set(config: ChainConfig) {
    CHAIN_CONFIGS.with_borrow_mut(|configs| {
        configs.insert(config.chain_id, config);
    });
}
