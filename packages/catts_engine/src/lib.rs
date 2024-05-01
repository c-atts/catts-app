mod declarations;
mod eas;
mod error;
mod eth;
mod evm_rpc;
mod logger;
mod recipe;
mod run;
mod service;
mod siwe;
mod state;
mod tasks;
mod user_profile;

use candid::{Nat, Principal};
use error::Error;
use eth::EthAddressBytes;
use ethers_core::abi::Contract;
use ic_cdk::{
    api::management_canister::http_request::{HttpResponse, TransformArgs},
    export_candid, init, post_upgrade,
};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{Cell, DefaultMemoryImpl, MinHeap, StableBTreeMap};
use lazy_static::lazy_static;
use logger::LogItem;
use recipe::Recipe;
use recipe::{init_recipes, RecipeId};
use run::run_service::{Run, RunId, Timestamp};
use state::State;
use std::cell::RefCell;
use std::sync::Arc;
use std::time::Duration;
use tasks::execute_tasks;
use user_profile::UserProfile;

type Memory = VirtualMemory<DefaultMemoryImpl>;

const ETH_DEFAULT_CALL_CYCLES: u64 = 30_000_000_000;
const ETH_PAYMENT_CONTRACT_ADDRESS: &str = "0xf4e6652aFF99525b2f38b9A990AA1EB5f42ABdF0";
const ETH_PAYMENT_EVENT_SIGNATURE: &str =
    "0x7c8809bb951e482559074456e6716ca166b1b6992b1205cfaae883fae81cf86a";
const TASKS_RUN_INTERVAL: u64 = 15; // 15 seconds
const ETH_PAYMENTS_LATEST_BLOCK_DEFAULT: u32 = 5814490;

pub fn authenticated() -> Result<(), String> {
    let caller = ic_cdk::api::caller();
    if caller == Principal::anonymous() {
        return Err(String::from("Access denied"));
    }
    Ok(())
}

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

    static RUNS: RefCell<StableBTreeMap<(EthAddressBytes, RunId), run::run_service::Run, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(2))),
        )
    );

    static TASK_QUEUE: RefCell<MinHeap<Timestamp, Memory>> = RefCell::new(
        MinHeap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(6))),
        ).unwrap()
    );

    static TASKS: RefCell<StableBTreeMap<Timestamp, tasks::Task, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(7))),
        )
    );

    static STABLE_STATE: RefCell<Cell<State, Memory>> = RefCell::new(Cell::init(
        MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(8))),
        State::new(),
    ).unwrap());

    static ECDSA_KEY: RefCell<String> = RefCell::new(String::default());
}

lazy_static! {
    static ref ETH_PAYMENT_CONTRACT: Arc<Contract> =
        Arc::new(include_abi!("../../catts_payments/catts_payments.abi.json"));
    static ref ETH_EAS_CONTRACT: Arc<Contract> = Arc::new(include_abi!("../../eas/eas.abi.json"));
}

fn init_and_upgrade(key_id: String) {
    ic_wasi_polyfill::init(&[0u8; 32], &[]);

    ECDSA_KEY.with(|key| {
        *key.borrow_mut() = key_id;
    });
    ic_cdk_timers::set_timer_interval(Duration::from_secs(TASKS_RUN_INTERVAL), || {
        execute_tasks();
    });

    STABLE_STATE.with_borrow_mut(|state_cell| {
        let mut state = state_cell.get().clone();
        if ETH_PAYMENTS_LATEST_BLOCK_DEFAULT > state.eth_payments_latest_block {
            state.eth_payments_latest_block = Nat::from(ETH_PAYMENTS_LATEST_BLOCK_DEFAULT);
        }
        state_cell.set(state).unwrap();
    });

    // Mock data
    init_recipes();
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
