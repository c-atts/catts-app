use crate::declarations::evm_rpc::*;
use crate::ECDSA_KEY;
use candid::Nat;
use ethers_core::abi::ethereum_types::{Address, U256, U64};
use ethers_core::abi::{Contract, FunctionExt, Token};
use ethers_core::types::Bytes;
use ethers_core::utils::keccak256;
use ic_cdk::api::{
    call::{call_with_payment, CallResult},
    management_canister::ecdsa::{
        ecdsa_public_key, sign_with_ecdsa, EcdsaKeyId, EcdsaPublicKeyArgument,
        SignWithEcdsaArgument,
    },
};
use k256::elliptic_curve::sec1::ToEncodedPoint;
use k256::PublicKey;
use serde::{Deserialize, Serialize};
use std::cell::RefCell;
use std::str::FromStr;

const CHAIN_ID: u128 = 11155111;
const GAS: u128 = 300_000;
const MAX_FEE_PER_GAS: u128 = 156_083_066_522_u128;
const MAX_PRIORITY_FEE_PER_GAS: u128 = 3_000_000_000;

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
        name: ECDSA_KEY.with(|key| key.borrow().clone()),
    }
}

async fn next_id() -> Nat {
    let res: CallResult<(MultiGetTransactionCountResult,)> = call_with_payment(
        crate::declarations::evm_rpc::evm_rpc.0,
        "eth_getTransactionCount",
        (
            RpcServices::EthSepolia(Some(vec![EthSepoliaService::BlockPi])),
            None::<RpcConfig>,
            GetTransactionCountArgs {
                address: get_self_eth_address().await,
                block: BlockTag::Latest,
            },
        ),
        2_000_000_000,
    )
    .await;
    match res {
        Ok((MultiGetTransactionCountResult::Consistent(GetTransactionCountResult::Ok(id)),)) => id,
        Ok((inconsistent,)) => ic_cdk::trap(&format!("Inconsistent: {inconsistent:?}")),
        Err(err) => ic_cdk::trap(&format!("{:?}", err)),
    }
}

/// Submit an ETH TX.
pub async fn eth_transaction(
    contract_address: String,
    abi: &Contract,
    function_name: &str,
    args: &[Token],
) -> Result<String, String> {
    let f = match abi.functions_by_name(function_name).map(|v| &v[..]) {
        Ok([f]) => f,
        Ok(fs) => panic!(
            "Found {} function overloads. Please pass one of the following: {}",
            fs.len(),
            fs.iter()
                .map(|f| format!("{:?}", f.abi_signature()))
                .collect::<Vec<_>>()
                .join(", ")
        ),
        Err(_) => abi
            .functions()
            .find(|f| function_name == f.abi_signature())
            .expect("Function not found"),
    };
    let data = f
        .encode_input(args)
        .expect("Error while encoding input args");
    let signed_data = sign_transaction(SignRequest {
        chain_id: CHAIN_ID.into(),
        to: contract_address,
        gas: GAS.into(),
        max_fee_per_gas: MAX_FEE_PER_GAS.into(),
        max_priority_fee_per_gas: MAX_PRIORITY_FEE_PER_GAS.into(),
        value: 0_u8.into(),
        nonce: next_id().await,
        data: Some(data.into()),
    })
    .await;

    let (res,): (MultiSendRawTransactionResult,) = call_with_payment(
        crate::declarations::evm_rpc::evm_rpc.0,
        "eth_sendRawTransaction",
        (
            RpcServices::EthSepolia(Some(vec![
                EthSepoliaService::PublicNode,
                EthSepoliaService::BlockPi,
                EthSepoliaService::Ankr,
            ])),
            None::<RpcConfig>,
            signed_data.clone(),
        ),
        2_000_000_000,
    )
    .await
    .unwrap();

    match res {
        MultiSendRawTransactionResult::Consistent(SendRawTransactionResult::Ok(
            SendRawTransactionStatus::Ok(txid),
        )) => match txid {
            Some(txid) => Ok(txid),
            None => Err("Transaction failed".to_string()),
        },
        other => Err(format!("{:?}", other)),
    }
}

pub async fn eth_get_transaction_receipt(hash: &str) -> Result<TransactionReceipt, String> {
    ic_cdk::println!("eth_get_transaction_receipt: {}", hash);

    let (res,): (MultiGetTransactionReceiptResult,) = call_with_payment(
        crate::declarations::evm_rpc::evm_rpc.0,
        "eth_getTransactionReceipt",
        (
            RpcServices::EthSepolia(Some(vec![
                EthSepoliaService::PublicNode,
                EthSepoliaService::BlockPi,
                EthSepoliaService::Ankr,
            ])),
            None::<RpcConfig>,
            hash,
        ),
        2_000_000_000,
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
