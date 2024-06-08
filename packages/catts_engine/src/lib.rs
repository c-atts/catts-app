mod chain_config;
mod controllers;
mod declarations;
mod eas;
mod error;
mod eth;
mod evm_rpc;
mod graphql;
mod logger;
mod profile;
mod recipe;
mod run;
mod siwe;
mod tasks;
mod thegraph;

use chain_config::{init_chain_configs, ChainConfig};
use error::Error;
use eth::EthAddressBytes;
use ethers_core::abi::Contract;
use ic_cdk::{
    api::management_canister::http_request::{HttpResponse, TransformArgs},
    export_candid, init, post_upgrade,
};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap};
use lazy_static::lazy_static;
use logger::LogItem;
use profile::UserProfile;
use recipe::Recipe;
use recipe::{init_recipes, RecipeId};
use run::run::{Run, RunId, Timestamp};
use std::cell::RefCell;
use std::sync::Arc;
use std::time::Duration;
use tasks::execute_tasks;

type Memory = VirtualMemory<DefaultMemoryImpl>;

const ETH_DEFAULT_CALL_CYCLES: u64 = 30_000_000_000;
const ETH_AVG_FEE_HISTORY_BLOCK_COUNT: u64 = 4;

const ETH_PAYMENT_EVENT_SIGNATURE: &str =
    "0x7c8809bb951e482559074456e6716ca166b1b6992b1205cfaae883fae81cf86a";
const TASKS_RUN_INTERVAL: u64 = 15; // 15 seconds

const THEGRAPH_QUERY_PROXY_URL: &str =
    "https://catts-thegraph-query-proxy.kristofer-977.workers.dev";

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static USER_PROFILES: RefCell<StableBTreeMap<String, UserProfile, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0))),
        )
    );

    static RECIPES: RefCell<StableBTreeMap<RecipeId, recipe::Recipe, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1))),
        )
    );

    static RECIPE_ID_BY_NAME: RefCell<StableBTreeMap<String, recipe::RecipeId, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(2))),
        )
    );

    static RUNS: RefCell<StableBTreeMap<(EthAddressBytes, RunId), run::run::Run, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(3))),
        )
    );

    static TASKS: RefCell<StableBTreeMap<Timestamp, tasks::Task, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(4))),
        )
    );

    static CHAIN_CONFIGS: RefCell<StableBTreeMap<u64, ChainConfig, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(5))),
        )
    );

    static ECDSA_KEY_ID: RefCell<String> = RefCell::new(String::default());
}

lazy_static! {
    static ref ETH_PAYMENT_CONTRACT: Arc<Contract> =
        Arc::new(include_abi!("../../catts_payments/catts_payments.abi.json"));
    static ref ETH_EAS_CONTRACT: Arc<Contract> = Arc::new(include_abi!("../../eas/eas.abi.json"));
}

fn init_and_upgrade(key_id: String) {
    ic_wasi_polyfill::init(&[0u8; 32], &[]);

    ECDSA_KEY_ID.with(|id| {
        *id.borrow_mut() = key_id;
    });

    ic_cdk_timers::set_timer_interval(Duration::from_secs(TASKS_RUN_INTERVAL), || {
        execute_tasks();
    });

    // Mock data
    init_recipes();
    init_chain_configs();
}

#[init]
fn init(key_id: String) {
    init_and_upgrade(key_id);
}

#[post_upgrade]
fn post_upgrade(key_id: String) {
    init_and_upgrade(key_id);
}

export_candid!();
