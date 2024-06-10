use crate::chain_config::ChainConfig;
use crate::declarations::evm_rpc::*;
use crate::{ECDSA_KEY_ID, ETH_AVG_FEE_HISTORY_BLOCK_COUNT, ETH_DEFAULT_CALL_CYCLES};
use candid::Nat;
use ethers_core::abi::ethereum_types::{Address, U256, U64};
use ethers_core::abi::{Contract, FunctionExt, Token};
use ethers_core::types::Bytes;
use ethers_core::utils::keccak256;
use ic_cdk::api::{
    call::{call_with_payment, CallResult, RejectionCode},
    management_canister::ecdsa::{
        ecdsa_public_key, sign_with_ecdsa, EcdsaKeyId, EcdsaPublicKeyArgument,
        SignWithEcdsaArgument,
    },
};
use k256::elliptic_curve::sec1::ToEncodedPoint;
use k256::PublicKey;
use num_bigint::BigUint;
use serde::{Deserialize, Serialize};
use std::cell::RefCell;
use std::str::FromStr;
use thiserror::Error;

#[derive(Clone, Debug, Serialize, Deserialize)]
struct JsonRpcRequest {
    id: u64,
    jsonrpc: String,
    method: String,
    params: (EthCallParams, String),
}

#[derive(Clone, Debug, Serialize, Deserialize)]
struct EthCallParams {
    to: String,
    data: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
struct JsonRpcResult {
    result: Option<String>,
    error: Option<JsonRpcError>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
struct JsonRpcError {
    code: isize,
    message: String,
}

fn ecdsa_key_id() -> EcdsaKeyId {
    EcdsaKeyId {
        curve: ic_cdk::api::management_canister::ecdsa::EcdsaCurve::Secp256k1,
        name: ECDSA_KEY_ID.with(|key| key.borrow().clone()),
    }
}

async fn next_id(chain_config: &ChainConfig) -> Nat {
    let res: CallResult<(MultiGetTransactionCountResult,)> = call_with_payment(
        crate::declarations::evm_rpc::evm_rpc.0,
        "eth_getTransactionCount",
        (
            chain_config.eth_service(),
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

pub async fn update_base_fee(chain_config: &ChainConfig) -> Result<ChainConfig, String> {
    let res: CallResult<(MultiFeeHistoryResult,)> = call_with_payment(
        crate::declarations::evm_rpc::evm_rpc.0,
        "eth_feeHistory",
        (
            chain_config.eth_service(),
            None::<RpcConfig>,
            FeeHistoryArgs {
                blockCount: ETH_AVG_FEE_HISTORY_BLOCK_COUNT.into(),
                newestBlock: BlockTag::Latest,
                rewardPercentiles: None,
            },
        ),
        ETH_DEFAULT_CALL_CYCLES,
    )
    .await;

    match res {
        Ok((MultiFeeHistoryResult::Consistent(FeeHistoryResult::Ok(fee_history)),)) => {
            let fee_history = fee_history.ok_or_else(|| "Fee history is None")?;
            let mut sum: BigUint = 0u8.into();
            for fee in fee_history.baseFeePerGas.iter() {
                sum += fee.0.clone();
            }
            let avg = sum / fee_history.baseFeePerGas.len();
            let mut chain_config = chain_config.clone();
            chain_config.base_fee = avg.into();
            Ok(chain_config)
        }
        Ok((inconsistent,)) => ic_cdk::trap(&format!("Inconsistent: {inconsistent:?}")),
        Err(err) => ic_cdk::trap(&format!("{:?}", err)),
    }
}

pub fn max_fee_per_gas(chain_config: &ChainConfig) -> Nat {
    chain_config.base_fee.clone() * 2_u8
}

#[derive(Error, Debug)]
pub enum EthTransactionError {
    #[error("Function not found: {0}")]
    FunctionNotFound(String),

    #[error("Unable to encode args")]
    ArgsEncoding,

    #[error("Call error")]
    CallError((RejectionCode, String)),

    #[error("No transaction Id returned")]
    NoTransactionId,

    #[error("MultiSendRawTransaction: {0:?}")]
    MultiSendRawTransaction(MultiSendRawTransactionResult),
}

/// Submit an ETH TX.
pub async fn eth_transaction(
    contract_address: String,
    abi: &Contract,
    function_name: &str,
    args: &[Token],
    gas: Nat,
    chain_config: &ChainConfig,
) -> Result<String, EthTransactionError> {
    let f = match abi.functions_by_name(function_name).map(|v| &v[..]) {
        Ok([f]) => Ok(f),
        Ok(fs) => {
            panic!(
                "Found {} function overloads. Please pass one of the following: {}",
                fs.len(),
                fs.iter()
                    .map(|f| format!("{:?}", f.abi_signature()))
                    .collect::<Vec<_>>()
                    .join(", ")
            )
        }
        Err(_) => abi
            .functions()
            .find(|f| function_name == f.abi_signature())
            .ok_or_else(|| EthTransactionError::FunctionNotFound(function_name.to_string())),
    }?;

    let data = f
        .encode_input(args)
        .map_err(|_| EthTransactionError::ArgsEncoding)?;

    let signed_data = sign_transaction(SignRequest {
        chain_id: chain_config.chain_id.into(),
        to: contract_address,
        gas,
        max_fee_per_gas: max_fee_per_gas(chain_config).into(),
        max_priority_fee_per_gas: chain_config.priority_fee.clone(),
        value: 0_u8.into(),
        nonce: next_id(&chain_config).await,
        data: Some(data.into()),
    })
    .await;

    let (res,): (MultiSendRawTransactionResult,) = call_with_payment(
        crate::declarations::evm_rpc::evm_rpc.0,
        "eth_sendRawTransaction",
        (
            chain_config.eth_service(),
            None::<RpcConfig>,
            signed_data.clone(),
        ),
        ETH_DEFAULT_CALL_CYCLES,
    )
    .await
    .map_err(|e| EthTransactionError::CallError(e))?;

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

pub async fn eth_get_transaction_receipt(
    hash: &str,
    chain_config: &ChainConfig,
) -> Result<TransactionReceipt, String> {
    ic_cdk::println!("eth_get_transaction_receipt: {}", hash);

    let (res,): (MultiGetTransactionReceiptResult,) = call_with_payment(
        crate::declarations::evm_rpc::evm_rpc.0,
        "eth_getTransactionReceipt",
        (chain_config.eth_service(), None::<RpcConfig>, hash),
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

pub async fn get_payment_logs_for_block(
    block_number: u128,
    chain_config: &ChainConfig,
) -> Result<(MultiGetLogsResult,), String> {
    let res: CallResult<(MultiGetLogsResult,)> = call_with_payment(
        evm_rpc.0,
        "eth_getLogs",
        (
            chain_config.eth_service(),
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
    .await;

    match res {
        Ok(result) => Ok(result),
        Err(err) => Err(format!("{:?}", err)),
    }
}

#[derive(Debug)]
struct SignRequest {
    pub chain_id: Nat,
    pub to: String,
    pub gas: Nat,
    pub max_fee_per_gas: Nat,
    pub max_priority_fee_per_gas: Nat,
    /// ETH to send
    pub value: Nat,
    pub nonce: Nat,
    pub data: Option<Bytes>,
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
        max_priority_fee_per_gas: Some(nat_to_u256(&req.max_priority_fee_per_gas)),
        max_fee_per_gas: Some(nat_to_u256(&req.max_fee_per_gas)),
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
fn nat_to_u256(n: &Nat) -> U256 {
    let be_bytes = n.0.to_bytes_be();
    U256::from_big_endian(&be_bytes)
}

fn nat_to_u64(n: &Nat) -> U64 {
    let be_bytes = n.0.to_bytes_be();
    U64::from_big_endian(&be_bytes)
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
