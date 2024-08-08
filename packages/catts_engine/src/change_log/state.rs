use crate::{json::ToJsonValue, CHANGE_LOG};

use super::{ChangeLogItem, ChangeLogTypeName};
use anyhow::{anyhow, Result};

pub fn create<T: ToJsonValue>(type_name: ChangeLogTypeName, id: [u8; 12], data: T) -> Result<u64> {
    CHANGE_LOG.with_borrow_mut(|logs| {
        let change_log_item = ChangeLogItem::create(type_name, id, data);
        logs.append(&change_log_item)
            .map_err(|err| anyhow!(format!("Failed to append to change log: {:?}", err)))
    })
}

pub fn update<T: ToJsonValue>(
    type_name: ChangeLogTypeName,
    id: [u8; 12],
    old_data: T,
    new_data: T,
) -> Result<u64> {
    CHANGE_LOG.with_borrow_mut(|logs| {
        let change_log_item = ChangeLogItem::update(type_name, id, old_data, new_data);
        logs.append(&change_log_item)
            .map_err(|err| anyhow!(format!("Failed to append to change log: {:?}", err)))
    })
}

pub fn delete(type_name: ChangeLogTypeName, id: [u8; 12]) -> Result<u64> {
    CHANGE_LOG.with_borrow_mut(|logs| {
        let change_log_item = ChangeLogItem::delete(type_name, id);
        logs.append(&change_log_item)
            .map_err(|err| anyhow!(format!("Failed to append to change log: {:?}", err)))
    })
}
