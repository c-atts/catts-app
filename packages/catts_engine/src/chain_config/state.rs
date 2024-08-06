use super::{ChainConfig, ChainConfigError};
use crate::CHAIN_CONFIGS;

pub fn get(chain_id: u32) -> Result<ChainConfig, ChainConfigError> {
    CHAIN_CONFIGS
        .with_borrow(|configs| configs.get(&chain_id))
        .ok_or(ChainConfigError::NotFound)
}

pub fn _set(config: ChainConfig) {
    CHAIN_CONFIGS.with_borrow_mut(|configs| {
        configs.insert(config.chain_id, config);
    });
}
