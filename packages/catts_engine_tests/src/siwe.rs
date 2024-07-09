use candid::{encode_args, encode_one, Principal};
use ethers::{
    core::k256::ecdsa::SigningKey,
    signers::{LocalWallet, Signer, Wallet},
    utils::{hash_message, to_checksum},
};
use ic_agent::{
    identity::{
        BasicIdentity, DelegatedIdentity, Delegation as AgentDelegation,
        SignedDelegation as AgentSignedDelegation,
    },
    Identity,
};
use ic_siwe::{delegation::SignedDelegation, login::LoginDetails};
use pocket_ic::PocketIc;
use rand::Rng;

use crate::{
    common::{query, update},
    types::User,
};

pub fn create_wallet() -> (ethers::signers::LocalWallet, String) {
    let wallet = LocalWallet::new(&mut rand::thread_rng());
    let h160 = wallet.address();
    let address = to_checksum(&h160, None);
    (wallet, address)
}

pub fn prepare_login_and_sign_message(
    ic: &PocketIc,
    ic_siwe_provider_canister: Principal,
    wallet: Wallet<SigningKey>,
    address: &str,
) -> (String, String) {
    let args = encode_one(address).unwrap();
    let siwe_message: String = update(
        ic,
        ic_siwe_provider_canister,
        Principal::anonymous(),
        "siwe_prepare_login",
        args,
    )
    .unwrap();
    let hash = hash_message(siwe_message.as_bytes());
    let signature = wallet.sign_hash(hash).unwrap().to_string();
    (format!("0x{}", signature.as_str()), siwe_message)
}

pub fn create_session_identity() -> BasicIdentity {
    let mut ed25519_seed = [0u8; 32];
    rand::thread_rng().fill(&mut ed25519_seed);
    let ed25519_keypair =
        ring::signature::Ed25519KeyPair::from_seed_unchecked(&ed25519_seed).unwrap();
    BasicIdentity::from_key_pair(ed25519_keypair)
}

pub fn create_delegated_identity(
    identity: BasicIdentity,
    login_response: &LoginDetails,
    signature: Vec<u8>,
    targets: Option<Vec<Principal>>,
) -> DelegatedIdentity {
    // Create a delegated identity
    let signed_delegation = AgentSignedDelegation {
        delegation: AgentDelegation {
            pubkey: identity.public_key().unwrap(),
            expiration: login_response.expiration,
            targets,
        },
        signature,
    };
    DelegatedIdentity::new(
        login_response.user_canister_pubkey.to_vec(),
        Box::new(identity),
        vec![signed_delegation],
    )
}

pub fn full_login(
    ic: &PocketIc,
    ic_siwe_provider_canister: Principal,
    catts_canister: Principal,
    targets: Option<Vec<Principal>>,
) -> (String, DelegatedIdentity) {
    let (wallet, address) = create_wallet();
    let (signature, _) =
        prepare_login_and_sign_message(ic, ic_siwe_provider_canister, wallet, &address);

    // Create a session identity
    let session_identity = create_session_identity();

    let session_pubkey = session_identity.public_key().unwrap();

    // Login
    let login_args = encode_args((signature, address.clone(), session_pubkey.clone())).unwrap();
    let login_response: LoginDetails = update(
        ic,
        ic_siwe_provider_canister,
        Principal::anonymous(),
        "siwe_login",
        login_args,
    )
    .unwrap();

    // Get the delegation
    let get_delegation_args = encode_args((
        address.clone(),
        session_pubkey.clone(),
        login_response.expiration,
    ))
    .unwrap();

    let get_delegation_response: SignedDelegation = query(
        ic,
        ic_siwe_provider_canister,
        Principal::anonymous(),
        "siwe_get_delegation",
        get_delegation_args,
    )
    .unwrap();

    // Create a delegated identity
    let delegated_identity = create_delegated_identity(
        session_identity,
        &login_response,
        get_delegation_response.signature.as_ref().to_vec(),
        targets,
    );

    // Create a user in the catts canister
    let _: User = update(
        ic,
        catts_canister,
        delegated_identity.sender().unwrap(),
        "user_create",
        encode_one(()).unwrap(),
    )
    .unwrap();

    (address, delegated_identity)
}
