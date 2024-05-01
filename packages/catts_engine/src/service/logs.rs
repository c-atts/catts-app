use ic_cdk::query;

use crate::logger::{self, LogItem};

#[query]
pub fn logs() -> Vec<LogItem> {
    logger::get()
}
