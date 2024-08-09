use crate::{
    chain_config::ChainConfig,
    declarations::evm_rpc::{
        evm_rpc, Block, BlockTag, FeeHistory, FeeHistoryArgs, FeeHistoryResult,
        GetBlockByNumberResult, GetLogsArgs, GetLogsResult, GetTransactionCountArgs,
        GetTransactionCountResult, GetTransactionReceiptResult, LogEntry, MultiFeeHistoryResult,
        MultiGetBlockByNumberResult, MultiGetLogsResult, MultiGetTransactionCountResult,
        MultiGetTransactionReceiptResult, MultiSendRawTransactionResult, RequestResult, RpcConfig,
        RpcError, SendRawTransactionResult, SendRawTransactionStatus, TransactionReceipt,
    },
    evm::util::{ecdsa_key_id, nat_to_u256, nat_to_u64},
    ETH_DEFAULT_CALL_CYCLES,
};
use candid::Nat;
use ethers_core::{
    abi::{
        ethereum_types::{Address, U256},
        Contract, Token,
    },
    k256::{self, elliptic_curve::sec1::ToEncodedPoint, PublicKey},
    utils::{hex, keccak256},
};
use ic_cdk::api::{
    call::{call_with_payment128, CallResult, RejectionCode},
    management_canister::ecdsa::{
        ecdsa_public_key, sign_with_ecdsa, EcdsaPublicKeyArgument, SignWithEcdsaArgument,
    },
};
use serde_bytes::ByteBuf;
use serde_json::json;
use std::{cell::RefCell, str::FromStr};
use thiserror::Error;

use super::{
    types::{JsonRpcErrorResponse, JsonRpcResponse, SignRequest},
    util::get_abi_function_by_name,
};

async fn next_id(chain_config: &ChainConfig) -> Nat {
    let res: CallResult<(MultiGetTransactionCountResult,)> = call_with_payment128(
        crate::declarations::evm_rpc::evm_rpc.0,
        "eth_getTransactionCount",
        (
            chain_config.rpc_services.clone(),
            None::<RpcConfig>,
            GetTransactionCountArgs {
                address: get_self_eth_address().await,
                block: BlockTag::Latest,
            },
        ),
        ETH_DEFAULT_CALL_CYCLES,
    )
    .await;
    match res {
        Ok((MultiGetTransactionCountResult::Consistent(GetTransactionCountResult::Ok(id)),)) => id,
        Ok((inconsistent,)) => ic_cdk::trap(&format!("Inconsistent: {inconsistent:?}")),
        Err(err) => ic_cdk::trap(&format!("{:?}", err)),
    }
}

#[derive(Error, Debug)]
pub enum EthTransactionError {
    #[error("Unable to encode args")]
    ArgsEncoding,

    #[error("Call error")]
    CallError((RejectionCode, String)),

    #[error("No transaction Id returned")]
    NoTransactionId,

    #[error("MultiSendRawTransaction: {0:?}")]
    MultiSendRawTransaction(MultiSendRawTransactionResult),

    #[error("Rpc error: {0:?}")]
    RpcError(RpcError),

    #[error("Json error: {0}")]
    JsonError(#[from] serde_json::Error),

    #[error("JsonRpc error: {0:?}")]
    JsonRpcError(JsonRpcErrorResponse),

    #[error("Inconsistent response")]
    InconsistentResponse,
}

#[allow(clippy::too_many_arguments)]
pub async fn eth_transaction(
    contract_address: String,
    abi_contract: &Contract,
    function_name: &str,
    args: &[Token],
    gas: Nat,
    max_fee_per_gas: Nat,
    max_priority_fee_per_gas: Nat,
    chain_config: &ChainConfig,
) -> Result<String, EthTransactionError> {
    let abi_function = get_abi_function_by_name(abi_contract, function_name);
    let data = abi_function
        .encode_input(args)
        .map_err(|_| EthTransactionError::ArgsEncoding)?;

    let signed_data = sign_transaction(SignRequest {
        chain_id: chain_config.chain_id.into(),
        to: contract_address,
        gas,
        max_fee_per_gas,
        max_priority_fee_per_gas,
        value: 0_u8.into(),
        nonce: next_id(chain_config).await,
        data: Some(data.into()),
    })
    .await;

    let (res,): (MultiSendRawTransactionResult,) = call_with_payment128(
        crate::declarations::evm_rpc::evm_rpc.0,
        "eth_sendRawTransaction",
        (
            chain_config.rpc_services.clone(),
            None::<RpcConfig>,
            signed_data.clone(),
        ),
        ETH_DEFAULT_CALL_CYCLES,
    )
    .await
    .map_err(EthTransactionError::CallError)?;

    match res {
        MultiSendRawTransactionResult::Consistent(SendRawTransactionResult::Ok(
            SendRawTransactionStatus::Ok(txid),
        )) => match txid {
            Some(txid) => Ok(txid),
            None => Err(EthTransactionError::NoTransactionId),
        },
        other => Err(EthTransactionError::MultiSendRawTransaction(other)),
    }
}

pub async fn eth_estimate_gas(
    contract_address: String,
    abi_contract: &Contract,
    function_name: &str,
    args: &[Token],
    chain_config: &ChainConfig,
) -> Result<String, EthTransactionError> {
    let abi_function = get_abi_function_by_name(abi_contract, function_name);
    let data = abi_function
        .encode_input(args)
        .map_err(|_| EthTransactionError::ArgsEncoding)?;

    let json_rpc_payload = json!({
        "id": 1,
        "jsonrpc": "2.0",
        "method": "eth_estimateGas",
        "params": [{
            "to": contract_address,
            "data": format!("0x{}", hex::encode(data)),
        }, "latest"],
    })
    .to_string();

    let (result,): (RequestResult,) = call_with_payment128(
        crate::declarations::evm_rpc::evm_rpc.0,
        "request",
        (
            chain_config.default_rpc_service.clone(),
            json_rpc_payload,
            2048_u64,
        ),
        ETH_DEFAULT_CALL_CYCLES,
    )
    .await
    .map_err(EthTransactionError::CallError)?;

    match result {
        RequestResult::Ok(s) => serde_json::from_str::<JsonRpcResponse>(&s)
            .map_err(EthTransactionError::JsonError)
            .and_then(|r| match r {
                JsonRpcResponse::Success(s) => Ok(s.result),
                JsonRpcResponse::Error(e) => Err(EthTransactionError::JsonRpcError(e)),
            }),
        RequestResult::Err(e) => Err(EthTransactionError::RpcError(e)),
    }
}

pub async fn eth_get_transaction_receipt(
    hash: &str,
    chain_config: &ChainConfig,
) -> Result<TransactionReceipt, String> {
    let (res,): (MultiGetTransactionReceiptResult,) = call_with_payment128(
        crate::declarations::evm_rpc::evm_rpc.0,
        "eth_getTransactionReceipt",
        (chain_config.rpc_services.clone(), None::<RpcConfig>, hash),
        ETH_DEFAULT_CALL_CYCLES,
    )
    .await
    .unwrap();

    match res {
        MultiGetTransactionReceiptResult::Consistent(GetTransactionReceiptResult::Ok(receipt)) => {
            match receipt {
                Some(receipt) => Ok(receipt),
                None => Err("Receipt not found".to_string()),
            }
        }
        other => Err(format!("{:?}", other)),
    }
}

pub async fn get_run_payment_logs(
    block_number: u128,
    chain_config: &ChainConfig,
) -> Result<Vec<LogEntry>, EthTransactionError> {
    let (res,): (MultiGetLogsResult,) = call_with_payment128(
        evm_rpc.0,
        "eth_getLogs",
        (
            chain_config.rpc_services.clone(),
            1,
            GetLogsArgs {
                addresses: vec![chain_config.payment_contract.clone()],
                fromBlock: Some(BlockTag::Number(block_number.into())),
                toBlock: Some(BlockTag::Number(block_number.into())),
                topics: None,
            },
        ),
        ETH_DEFAULT_CALL_CYCLES,
    )
    .await
    .map_err(EthTransactionError::CallError)?;

    match res {
        MultiGetLogsResult::Consistent(log_result) => match log_result {
            GetLogsResult::Ok(entries) => Ok(entries),
            GetLogsResult::Err(err) => Err(EthTransactionError::RpcError(err)),
        },
        MultiGetLogsResult::Inconsistent(_) => Err(EthTransactionError::InconsistentResponse),
    }
}

/// Computes a signature for an [EIP-1559](https://eips.ethereum.org/EIPS/eip-1559) transaction.
async fn sign_transaction(req: SignRequest) -> String {
    use ethers_core::types::transaction::eip1559::Eip1559TransactionRequest;
    use ethers_core::types::Signature;

    const EIP1559_TX_ID: u8 = 2;

    let tx = Eip1559TransactionRequest {
        chain_id: Some(nat_to_u64(&req.chain_id)),
        from: None,
        to: Some(
            Address::from_str(&req.to)
                .expect("failed to parse the destination address")
                .into(),
        ),
        gas: Some(nat_to_u256(&req.gas)),
        value: Some(nat_to_u256(&req.value)),
        nonce: Some(nat_to_u256(&req.nonce)),
        data: req.data,
        access_list: Default::default(),
        max_fee_per_gas: Some(nat_to_u256(&req.max_fee_per_gas)),
        max_priority_fee_per_gas: Some(nat_to_u256(&req.max_priority_fee_per_gas)),
    };

    let mut unsigned_tx_bytes = tx.rlp().to_vec();
    unsigned_tx_bytes.insert(0, EIP1559_TX_ID);

    let txhash = keccak256(&unsigned_tx_bytes);

    let (pubkey, signature) = pubkey_and_signature(txhash.to_vec()).await;

    let signature = Signature {
        v: y_parity(&txhash, &signature, &pubkey),
        r: U256::from_big_endian(&signature[0..32]),
        s: U256::from_big_endian(&signature[32..64]),
    };

    let mut signed_tx_bytes = tx.rlp_signed(&signature).to_vec();
    signed_tx_bytes.insert(0, EIP1559_TX_ID);

    format!("0x{}", hex::encode(&signed_tx_bytes))
}

/// Computes the parity bit allowing to recover the public key from the signature.
fn y_parity(prehash: &[u8], sig: &[u8], pubkey: &[u8]) -> u64 {
    use k256::ecdsa::{RecoveryId, Signature, VerifyingKey};

    let orig_key = VerifyingKey::from_sec1_bytes(pubkey).expect("failed to parse the pubkey");
    let signature = Signature::try_from(sig).unwrap();
    for parity in [0u8, 1] {
        let recid = RecoveryId::try_from(parity).unwrap();
        let recovered_key = VerifyingKey::recover_from_prehash(prehash, &signature, recid)
            .expect("failed to recover key");
        if recovered_key == orig_key {
            return parity as u64;
        }
    }

    panic!(
        "failed to recover the parity bit from a signature; sig: {}, pubkey: {}",
        hex::encode(sig),
        hex::encode(pubkey)
    )
}

/// Returns the public key and a message signature for the specified principal.
async fn pubkey_and_signature(message_hash: Vec<u8>) -> (Vec<u8>, Vec<u8>) {
    // Fetch the pubkey and the signature concurrently to reduce latency.
    let (pubkey, response) = futures::join!(
        ecdsa_public_key(EcdsaPublicKeyArgument {
            canister_id: None,
            derivation_path: vec![],
            key_id: ecdsa_key_id()
        }),
        sign_with_ecdsa(SignWithEcdsaArgument {
            message_hash,
            derivation_path: vec![],
            key_id: ecdsa_key_id(),
        })
    );
    (
        pubkey.unwrap().0.public_key,
        response.expect("failed to sign the message").0.signature,
    )
}

thread_local! {
    static SELF_ETH_ADDRESS: RefCell<Option<String>> =
        const { RefCell::new(None) };
}

pub async fn get_self_eth_address() -> String {
    if SELF_ETH_ADDRESS.with(|maybe_address| maybe_address.borrow().is_none()) {
        let (pubkey,) = ecdsa_public_key(EcdsaPublicKeyArgument {
            canister_id: None,
            derivation_path: vec![],
            key_id: ecdsa_key_id(),
        })
        .await
        .unwrap();

        let key = PublicKey::from_sec1_bytes(&pubkey.public_key)
            .expect("failed to parse the public key as SEC1");
        let point = key.to_encoded_point(false);
        // we re-encode the key to the decompressed representation.
        let point_bytes = point.as_bytes();
        assert_eq!(point_bytes[0], 0x04);

        let hash = keccak256(&point_bytes[1..]);

        let self_address =
            ethers_core::utils::to_checksum(&Address::from_slice(&hash[12..32]), None);
        SELF_ETH_ADDRESS.with(|maybe_address| *maybe_address.borrow_mut() = Some(self_address));
    }

    SELF_ETH_ADDRESS.with(|maybe_address| maybe_address.borrow().clone().unwrap())
}

#[derive(Error, Debug)]
pub enum EvmRpcError {
    #[error("Rpc error: {0}")]
    Rpc(String),
    #[error("IC call error: {0}")]
    Ic(String),
    #[error("Inconsistent responses from multiple RPC services")]
    Inconsistent,
    #[error("Unexpected error: {0}")]
    Unexpected(String),
}

/// Returns the latest block with one caveat: if multiple Rpc services are specified and
/// they return inconsistent responses, the function will return the earliest block in the
/// - the "smallest common" latest block.
pub async fn eth_get_block_by_number(
    block_tag: BlockTag,
    chain_config: &ChainConfig,
) -> Result<Block, EvmRpcError> {
    let call_result: CallResult<(MultiGetBlockByNumberResult,)> = call_with_payment128(
        evm_rpc.0,
        "eth_getBlockByNumber",
        (
            chain_config.rpc_services.clone(),
            None::<RpcConfig>,
            block_tag,
            false,
        ),
        ETH_DEFAULT_CALL_CYCLES,
    )
    .await;

    let block: Block = match call_result {
        Ok((MultiGetBlockByNumberResult::Consistent(block),)) => match block {
            GetBlockByNumberResult::Ok(block) => block,
            GetBlockByNumberResult::Err(e) => {
                return Err(EvmRpcError::Rpc(format!("{:?}", e)));
            }
        },
        Ok((MultiGetBlockByNumberResult::Inconsistent(res),)) => {
            let mut maybe_earliest_block: Option<Block> = None;
            for r in res {
                if let (_, GetBlockByNumberResult::Ok(b)) = r {
                    match maybe_earliest_block {
                        Some(ref earliest_block) => {
                            if b.number < earliest_block.number {
                                maybe_earliest_block = Some(b);
                            }
                        }
                        None => {
                            maybe_earliest_block = Some(b);
                        }
                    }
                }
            }
            match maybe_earliest_block {
                Some(earliest_block) => earliest_block,
                None => {
                    return Err(EvmRpcError::Unexpected("No block found".to_string()));
                }
            }
        }
        Err(e) => {
            return Err(EvmRpcError::Ic(e.1));
        }
    };

    Ok(block)
}

pub async fn eth_fee_history(
    block_count: &Nat,
    newest_block: &BlockTag,
    reward_percentiles: Option<Vec<u8>>,
    chain_config: &ChainConfig,
) -> Result<FeeHistory, EvmRpcError> {
    let fee_history_args: FeeHistoryArgs = FeeHistoryArgs {
        blockCount: block_count.clone(),
        newestBlock: newest_block.clone(),
        rewardPercentiles: reward_percentiles.map(ByteBuf::from),
    };

    let call_result: CallResult<(MultiFeeHistoryResult,)> = call_with_payment128(
        evm_rpc.0,
        "eth_feeHistory",
        (
            chain_config.rpc_services.clone(),
            None::<RpcConfig>,
            fee_history_args,
        ),
        ETH_DEFAULT_CALL_CYCLES,
    )
    .await;

    let fee_history: FeeHistory = match call_result {
        Ok((res,)) => match res {
            MultiFeeHistoryResult::Consistent(fee_history) => match fee_history {
                FeeHistoryResult::Ok(maybe_fee_history) => match maybe_fee_history {
                    Some(fee_history) => fee_history,
                    None => {
                        return Err(EvmRpcError::Unexpected("No fee history found".to_string()));
                    }
                },
                FeeHistoryResult::Err(e) => {
                    return Err(EvmRpcError::Rpc(format!("{:?}", e)));
                }
            },
            MultiFeeHistoryResult::Inconsistent(_) => {
                return Err(EvmRpcError::Inconsistent);
            }
        },
        Err(e) => {
            return Err(EvmRpcError::Ic(e.1));
        }
    };

    Ok(fee_history)
}
