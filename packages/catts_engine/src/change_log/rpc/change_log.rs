use crate::{
    change_log::{ChangeLogResponse, IndexedChangeLogItem},
    http_error::HttpError,
    CHANGE_LOG,
};
use ic_cdk::query;

fn safe_u64_to_u32(value: u64) -> u32 {
    value.try_into().expect("Value exceeds u32::MAX")
}

#[query]
fn change_log(start_index: u32, limit: Option<u32>) -> Result<ChangeLogResponse, HttpError> {
    CHANGE_LOG.with_borrow(|log| {
        let start_index = start_index as u64;
        let limit = limit.map(|l| l as u64);
        let total_count = log.len();
        let end_index = limit.map_or(total_count, |l| std::cmp::min(start_index + l, total_count));

        if start_index >= total_count {
            return Ok(ChangeLogResponse {
                total_count: safe_u64_to_u32(total_count),
                data: Vec::new(),
            });
        }

        let data: Vec<IndexedChangeLogItem> = (start_index..end_index)
            .map(|index| {
                let item = log.get(index).unwrap();
                IndexedChangeLogItem {
                    index: safe_u64_to_u32(index),
                    data: item,
                }
            })
            .collect();

        Ok(ChangeLogResponse {
            total_count: safe_u64_to_u32(total_count),
            data,
        })
    })
}
