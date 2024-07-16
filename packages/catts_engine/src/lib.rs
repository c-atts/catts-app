mod chain_config;
mod controllers;
mod declarations;
mod eas;
mod error;
mod eth;
mod evm_rpc;
mod graphql;
mod logger;
mod recipe;
mod run;
mod siwe;
mod tasks;
mod user;

use candid::{CandidType, Principal};
use chain_config::{init_chain_configs, update_base_fee_per_gas, ChainConfig};
use error::Error;
use eth::EthAddressBytes;
use ethers_core::abi::Contract;
use evm_rpc_canister_types::EvmRpcCanister;
use ic_cdk::{
    api::management_canister::http_request::{HttpResponse, TransformArgs},
    export_candid, init, post_upgrade, trap,
};
use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager, VirtualMemory},
    storable::Blob,
};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap};
use lazy_static::lazy_static;
use logger::LogItem;
use recipe::Recipe;
use recipe::RecipeDetailsInput;
use recipe::RecipeId;
use run::run::{Run, RunId, Timestamp};
use serde::{Deserialize, Serialize};
use std::cell::RefCell;
use std::sync::Arc;
use std::time::Duration;
use tasks::execute_tasks;
use user::User;

type Memory = VirtualMemory<DefaultMemoryImpl>;

pub const EVM_RPC_CANISTER_ID: Principal =
    Principal::from_slice(b"\x00\x00\x00\x00\x02\x30\x00\xCC\x01\x01"); // 7hfb6-caaaa-aaaar-qadga-cai
pub const EVM_RPC: EvmRpcCanister = EvmRpcCanister(EVM_RPC_CANISTER_ID);

const ETH_DEFAULT_CALL_CYCLES: u64 = 30_000_000_000;
const ETH_DEFAULT_CALL_CYCLES_128: u128 = 30_000_000_000;
const ETH_FEE_HISTORY_BLOCK_COUNT: u64 = 4;

const ETH_PAYMENT_EVENT_SIGNATURE: &str =
    "0x7c8809bb951e482559074456e6716ca166b1b6992b1205cfaae883fae81cf86a";

const TIMER_INTERVAL_EXECUTE_TASKS: u64 = 15; // 15 seconds
const TIMER_INTERVAL_UPDATE_BASE_FEE_PER_GAS: u64 = 60 * 60; // 1 hour

// const THEGRAPH_QUERY_PROXY_URL: &str =
//     "https://catts-thegraph-query-proxy.kristofer-977.workers.dev";

const WASI_MEMORY_ID: MemoryId = MemoryId::new(0);
const USER_PROFILE_MEMORY_ID: MemoryId = MemoryId::new(1);
const RECIPE_MEMORY_ID: MemoryId = MemoryId::new(2);
const RECIPE_NAME_INDEX_MEMORY_ID: MemoryId = MemoryId::new(3);
const RUNS_MEMORY_ID: MemoryId = MemoryId::new(4);
const TASKS_MEMORY_ID: MemoryId = MemoryId::new(5);
const CHAIN_CONFIGS_MEMORY_ID: MemoryId = MemoryId::new(6);

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
    static ref ETH_PAYMENT_CONTRACT: Arc<Contract> =
        Arc::new(include_abi!("../../catts_payments/catts_payments.abi.json"));
    static ref ETH_EAS_CONTRACT: Arc<Contract> = Arc::new(include_abi!("../../eas/eas.abi.json"));
}

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    // CONFIG
    static CHAIN_CONFIGS: RefCell<StableBTreeMap<u64, ChainConfig, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(CHAIN_CONFIGS_MEMORY_ID)),
        )
    );

    static CANISTER_SETTINGS: RefCell<CanisterSettings> = RefCell::new(CanisterSettings::default());

    // USER
    static USERS: RefCell<StableBTreeMap<Blob<29>, User, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(USER_PROFILE_MEMORY_ID)),
        )
    );

    // RECIPES
    static RECIPES: RefCell<StableBTreeMap<RecipeId, recipe::Recipe, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(RECIPE_MEMORY_ID)),
        )
    );

    static RECIPE_NAME_INDEX: RefCell<StableBTreeMap<String, recipe::RecipeId, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(RECIPE_NAME_INDEX_MEMORY_ID)),
        )
    );

    // RUNS
    static RUNS: RefCell<StableBTreeMap<(EthAddressBytes, RunId), run::run::Run, Memory>> = RefCell::new(
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

fn start_base_fee_update_timer() {
    CHAIN_CONFIGS.with_borrow(|chain_configs| {
        for (index, (chain_id, _)) in chain_configs.iter().enumerate() {
            // Initial update
            ic_cdk_timers::set_timer(Duration::from_secs(index as u64 * 10), move || {
                update_base_fee_per_gas(chain_id);
            });

            // And then set the timer
            ic_cdk_timers::set_timer_interval(
                Duration::from_secs(TIMER_INTERVAL_UPDATE_BASE_FEE_PER_GAS),
                move || {
                    update_base_fee_per_gas(chain_id);
                },
            );
        }
    });
}

fn init_and_upgrade(settings: CanisterSettingsInput) {
    init_wasi();
    save_canister_settings(settings);
    start_task_timer();
    init_chain_configs();
    start_base_fee_update_timer();
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
