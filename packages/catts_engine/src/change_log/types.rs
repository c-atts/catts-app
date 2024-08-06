use std::borrow::Cow;

use candid::{CandidType, Decode, Encode};
use ic_stable_structures::{storable::Bound, Storable};
use serde::{Deserialize, Serialize};

use crate::json::{bytes_to_hex_string, ToJsonValue};

#[derive(Serialize, Deserialize, CandidType, Clone)]
pub struct ChangeLogResponse {
    pub total_count: u32,
    pub data: Vec<IndexedChangeLogItem>,
}

#[derive(Serialize, Deserialize, CandidType, Clone)]
pub struct IndexedChangeLogItem {
    pub index: u32,
    pub data: ChangeLogItem,
}

#[derive(Serialize, Deserialize, CandidType, Clone)]
pub enum ChangeLogTypeName {
    Recipe,
    Run,
    User,
}

#[derive(Serialize, Deserialize, CandidType, Clone)]
pub enum ChangeLogAction {
    Create,
    Update,
    Delete,
}

#[derive(Serialize, Deserialize, CandidType, Clone)]
pub struct ChangeLogItem {
    pub type_name: ChangeLogTypeName,
    pub id: String,
    pub action: ChangeLogAction,
    pub patch: String,
}

impl Storable for ChangeLogItem {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl ChangeLogItem {
    pub fn create<T: ToJsonValue>(type_name: ChangeLogTypeName, id: [u8; 12], data: T) -> Self {
        Self {
            type_name,
            id: bytes_to_hex_string(&id).to_string(),
            action: ChangeLogAction::Create,
            patch: data.to_json_value().to_string(),
        }
    }

    pub fn update<T: ToJsonValue>(
        type_name: ChangeLogTypeName,
        id: [u8; 12],
        old_data: T,
        new_data: T,
    ) -> Self {
        let patch = json_patch::diff(&old_data.to_json_value(), &new_data.to_json_value());

        Self {
            type_name,
            id: bytes_to_hex_string(&id).to_string(),
            action: ChangeLogAction::Update,
            patch: serde_json::to_string(&patch).unwrap(),
        }
    }

    // pub fn delete(type_name: TypeName, id: &[u8; 12]) -> Self {
    //     Self {
    //         type_name,
    //         action: ChangeLogAction::Delete,
    //         id: *id,
    //         patch: serde_json::to_string(&serde_json::Value::Null).unwrap(),
    //     }
    // }
}
