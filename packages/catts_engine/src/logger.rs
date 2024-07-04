use candid::CandidType;
use std::cell::RefCell;
use std::cmp::{Ord, PartialOrd};

const MAX_LOG_ITEMS: usize = 100;

thread_local! {
    pub static LOG_ITEMS: RefCell<Vec<LogItem>> = const { RefCell::new(Vec::new()) };
    pub static LOG_LEVEL: RefCell<LogLevel> = const { RefCell::new(LogLevel::Debug) };
}

#[derive(Clone, CandidType, PartialOrd, Ord, PartialEq, Eq)]
pub enum LogLevel {
    Error,
    Warn,
    Info,
    Debug,
}

#[derive(Clone, CandidType)]
pub struct LogItem {
    timestamp: u64,
    level: LogLevel,
    message: String,
}

pub fn log(level: LogLevel, message: &str) {
    LOG_LEVEL.with_borrow(|l| if level > *l {});

    ic_cdk::println!(
        "[{}] {}",
        match level {
            LogLevel::Error => "ERROR",
            LogLevel::Warn => "WARN",
            LogLevel::Info => "INFO",
            LogLevel::Debug => "DEBUG",
        },
        message
    );
    LOG_ITEMS.with(|logger| {
        logger.borrow_mut().push(LogItem {
            timestamp: ic_cdk::api::time(),
            level,
            message: message.to_string(),
        });

        if logger.borrow().len() > MAX_LOG_ITEMS {
            logger.borrow_mut().remove(0);
        }
    });
}

pub fn error(message: &str) {
    log(LogLevel::Error, message);
}

pub fn warn(message: &str) {
    log(LogLevel::Warn, message);
}

pub fn info(message: &str) {
    log(LogLevel::Info, message);
}

pub fn debug(message: &str) {
    log(LogLevel::Debug, message);
}

// Get the logs as string for the frontend
// [timestamp] [level] message
pub fn get() -> Vec<LogItem> {
    LOG_ITEMS.with_borrow(|log| log.to_vec())
}
