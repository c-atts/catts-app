use anyhow::{bail, Result};
use candid::Nat;

pub fn vec_to_run_id(bytes: Vec<u8>) -> Result<[u8; 12], String> {
    if bytes.len() == 12 {
        let mut array = [0u8; 12];
        array.copy_from_slice(&bytes[0..12]);
        Ok(array)
    } else {
        Err("Vector should have 12 elements".to_string())
    }
}

pub fn get_min_gasfee_for_chain(chain_id: u32) -> Result<Nat> {
    let fee: u64 = match chain_id {
        11155111 => 500000000000000, // Sepolia, 0.0005 ETH
        10 => 50000000000000,        // Optimism, 0.00005 ETH
        8453 => 50000000000000,      // Base, 0.00005 ETH
        42161 => 50000000000000,     // Arbitrum One, 0.00005 ETH
        _ => bail!("Chain not supported"),
    };
    Ok(Nat::from(fee))
}

pub fn get_cyclesfee_for_chain(chain_id: u32) -> Result<Nat> {
    let fee: u64 = match chain_id {
        11155111 => 500000000000000, // Sepolia, 0.0005 ETH
        10 => 50000000000000,        // Optimism, 0.00005 ETH
        8453 => 50000000000000,      // Base, 0.00005 ETH
        42161 => 50000000000000,     // Arbitrum One, 0.00005 ETH
        _ => bail!("Chain not supported"),
    };
    Ok(Nat::from(fee))
}
