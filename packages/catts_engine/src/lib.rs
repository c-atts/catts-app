mod certified_data;
mod chain_config;
mod change_log;
mod controllers;
#[allow(
    clippy::too_many_arguments,
    clippy::large_enum_variant,
    clippy::enum_variant_names
)]
mod declarations;
mod eas;
mod eth_address;
mod evm;
mod graphql;
mod http_error;
mod http_request;
mod json;
mod logger;
mod recipe;
mod run;
mod siwe;
mod tasks;
mod time;
mod user;

use asset_util::CertifiedAssets;
use candid::{CandidType, Nat};
use certified_data::init_assets;
use chain_config::{init_chain_configs, ChainConfig};
use change_log::{ChangeLogItem, ChangeLogResponse};
use eth_address::EthAddressBytes;
use ethers_core::abi::Contract;
use http_error::HttpError;
use http_request::http::HttpRequest;
use ic_canister_sig_creation::signature_map::SignatureMap;
use ic_cdk::{
    api::management_canister::http_request::{HttpResponse, TransformArgs},
    export_candid, init, post_upgrade, trap,
};
use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager, VirtualMemory},
    storable::Blob,
    DefaultMemoryImpl, Log, StableBTreeMap,
};
use lazy_static::lazy_static;
use logger::LogItem;
use recipe::{Recipe, RecipeDetailsInput, RecipeId};
use run::{Run, RunId};
use serde::{Deserialize, Serialize};
use serde_bytes::ByteBuf;
use std::{cell::RefCell, collections::HashMap, sync::Arc, time::Duration};
use tasks::{execute_tasks, Timestamp};
use user::User;

type Memory = VirtualMemory<DefaultMemoryImpl>;

const ETH_DEFAULT_CALL_CYCLES: u128 = 30_000_000_000;

const ETH_PAYMENT_EVENT_SIGNATURE: &str =
    "0x7c8809bb951e482559074456e6716ca166b1b6992b1205cfaae883fae81cf86a";

const TIMER_INTERVAL_EXECUTE_TASKS: u64 = 15; // 15 seconds

const QUERY_PROXY_URL: &str = "https://query.catts.run";

const WASI_MEMORY_ID: MemoryId = MemoryId::new(0);
const USERS_MEMORY_ID: MemoryId = MemoryId::new(1);
const USER_ETH_ADDRESS_MEMORY_ID: MemoryId = MemoryId::new(2);
const RECIPES_MEMORY_ID: MemoryId = MemoryId::new(3);
const RECIPE_NAME_INDEX_MEMORY_ID: MemoryId = MemoryId::new(4);
const RUNS_MEMORY_ID: MemoryId = MemoryId::new(5);
const TASKS_MEMORY_ID: MemoryId = MemoryId::new(6);
const CHANGE_LOG_INDEX_MEMORY_ID: MemoryId = MemoryId::new(8);
const CHANGE_LOG_DATA_MEMORY_ID: MemoryId = MemoryId::new(9);

#[derive(Serialize, Deserialize, CandidType)]
struct CanisterSettingsInput {
    ecdsa_key_id: String,
    siwe_provider_canister: String,
    evm_rpc_canister: String,
}

#[derive(Debug, Default)]
pub struct CanisterSettings {
    pub ecdsa_key_id: String,
    pub siwe_provider_canister: String,
    pub evm_rpc_canister: String,
}

lazy_static! {
    static ref ETH_EAS_CONTRACT: Arc<Contract> = Arc::new(include_abi!("../../eas/eas.abi.json"));
}

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    // CONFIG
    static CHAIN_CONFIGS: RefCell<HashMap<u32, ChainConfig>> = RefCell::new(HashMap::new());
    static CANISTER_SETTINGS: RefCell<CanisterSettings> = RefCell::new(CanisterSettings::default());

    // USERS
    static USERS: RefCell<StableBTreeMap<Blob<29>, User, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(USERS_MEMORY_ID)),
        )
    );

    static USER_ETH_ADDRESS_INDEX: RefCell<StableBTreeMap<EthAddressBytes, Blob<29>, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(USER_ETH_ADDRESS_MEMORY_ID)),
        )
    );

    // RECIPES
    static RECIPES: RefCell<StableBTreeMap<RecipeId, recipe::Recipe, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(RECIPES_MEMORY_ID)),
        )
    );

    static RECIPE_NAME_INDEX: RefCell<StableBTreeMap<String, recipe::RecipeId, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(RECIPE_NAME_INDEX_MEMORY_ID)),
        )
    );

    // RUNS
    static RUNS: RefCell<StableBTreeMap<RunId, run::Run, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(RUNS_MEMORY_ID)),
        )
    );

    // TASKS
    static TASKS: RefCell<StableBTreeMap<Timestamp, tasks::Task, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(TASKS_MEMORY_ID)),
        )
    );

    // CHANGE LOG
    static CHANGE_LOG: RefCell<Log<ChangeLogItem, Memory, Memory>> = RefCell::new(
        Log::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(CHANGE_LOG_INDEX_MEMORY_ID)),
            MEMORY_MANAGER.with(|m| m.borrow().get(CHANGE_LOG_DATA_MEMORY_ID)),
        ).expect("Failed to initialize change log.")
    );

    // CERTIFIED ASSETS
    static SIGNATURES : RefCell<SignatureMap> = RefCell::new(SignatureMap::default());
    static ASSETS: RefCell<CertifiedAssets> = RefCell::new(CertifiedAssets::default());
}

fn init_wasi() {
    let wasi_memory = MEMORY_MANAGER.with(|m| m.borrow().get(WASI_MEMORY_ID));
    ic_wasi_polyfill::init_with_memory(&[0u8; 32], &[], wasi_memory);
}

fn save_canister_settings(settings: CanisterSettingsInput) {
    if settings.ecdsa_key_id.is_empty() {
        trap("The field ecdsa_key_id is required");
    }
    if settings.siwe_provider_canister.is_empty() {
        trap("The field siwe_provider_canister is required");
    }
    if settings.evm_rpc_canister.is_empty() {
        trap("The field evm_rpc_canister is required");
    }

    CANISTER_SETTINGS.with_borrow_mut(|canister_settings| {
        *canister_settings = CanisterSettings {
            ecdsa_key_id: settings.ecdsa_key_id.clone(),
            siwe_provider_canister: settings.siwe_provider_canister.clone(),
            evm_rpc_canister: settings.evm_rpc_canister.clone(),
        };
    });
}

fn start_task_timer() {
    ic_cdk_timers::set_timer_interval(Duration::from_secs(TIMER_INTERVAL_EXECUTE_TASKS), || {
        execute_tasks();
    });
}

fn init_and_upgrade(settings: CanisterSettingsInput) {
    init_wasi();
    save_canister_settings(settings);
    start_task_timer();
    init_chain_configs();
    init_assets();
}

#[init]
fn init(settings: CanisterSettingsInput) {
    init_and_upgrade(settings);
}

#[post_upgrade]
fn post_upgrade(settings: CanisterSettingsInput) {
    init_and_upgrade(settings);
}

export_candid!();
