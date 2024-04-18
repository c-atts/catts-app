use std::borrow::Cow;

use candid::{CandidType, Decode, Encode};
use ic_stable_structures::{storable::Bound, Storable};
use serde::{Deserialize, Serialize};

use crate::{eas::Uid, RECIPES};

type Query = String;
type QueryVariable = String;
type QuerySetting = String;
type Processor = String;

const MAX_VALUE_SIZE: u32 = 1024;

#[derive(Serialize, Deserialize, Debug, CandidType, Clone)]
pub struct Recipe {
    pub name: String,
    pub version: String,
    pub description: Option<String>,
    pub keywords: Option<Vec<String>>,
    pub homepage: Option<String>,
    pub author: Option<String>,
    pub created: u64,
    pub queries: Vec<Query>,
    pub query_variables: Vec<QueryVariable>,
    pub query_settings: Vec<QuerySetting>,
    pub processor: Processor,
    pub output_schema: Uid,
}

impl Storable for Recipe {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: MAX_VALUE_SIZE,
        is_fixed_size: false,
    };
}

impl Recipe {
    pub fn new(name: &str, version: &str) -> Self {
        Self {
            name: name.to_string(),
            version: version.to_string(),
            description: None,
            keywords: None,
            homepage: None,
            author: None,
            created: ic_cdk::api::time(),
            queries: vec![],
            query_variables: vec![],
            query_settings: vec![],
            processor: "".to_string(),
            output_schema: "".to_string(),
        }
    }

    pub fn get(name: &str) -> Option<Self> {
        RECIPES.with_borrow(|recipes| recipes.get(&name.to_string()))
    }

    pub fn create(recipe: Self) {
        RECIPES.with_borrow_mut(|recipes| {
            recipes.insert(recipe.name.clone(), recipe);
        });
    }

    pub fn list() -> Vec<Self> {
        RECIPES.with_borrow(|recipes| recipes.iter().map(|(_, recipe)| recipe.clone()).collect())
    }
}

pub fn init_recipes() {
    RECIPES.with_borrow_mut(|recipes| {
        recipes.insert("Copy Gitcoin Passport Score".to_string(), Recipe {
            name: "Copy Gitcoin Passport Score".to_string(),
            version: "0.1.0".to_string(),
            description: Some("This recipe allows you to make a copy of your Gitcoin Passport score to another chain.".to_string()),
            keywords: None,
            homepage: None,
            author: Some("Kristofer Lund".to_string()),
            created: ic_cdk::api::time(),
            queries: vec!["query PassportQuery($where: AttestationWhereInput) { attestations(where: $where) { decodedDataJson }}".to_string()],
            query_variables: vec![r#"{ "where": { "schemaId": { "equals": "0x6ab5d34260fca0cfcf0e76e96d439cace6aa7c3c019d7c4580ed52c6845e9c89" }, "recipient": {  "equals": "{user_eth_address}" } }, "take": 1 }"#.to_string()],
            query_settings: vec![r#"{"chainId": 10}"#.to_string()],
            processor: r#"return JSON.stringify(data.map((item) => item.value));"#.to_string(),
            output_schema: "uint256 score,uint32 scorer_id,uint8 score_decimals".to_string(),            
        });
        recipes.insert("Other Recipe".to_string(), Recipe {
            name: "Other Recipe".to_string(),
            version: "0.1.0".to_string(),
            description: Some("This recipe does some other cool thing with your attestation data.".to_string()),
            keywords: None,
            homepage: None,
            author: Some("Kristofer Lund".to_string()),
            created: ic_cdk::api::time(),
            queries: vec!["query PassportQuery($where: AttestationWhereInput) { attestations(where: $where) { decodedDataJson }}".to_string()],
            query_variables: vec![r#"{ "where": { "schemaId": { "equals": "0x6ab5d34260fca0cfcf0e76e96d439cace6aa7c3c019d7c4580ed52c6845e9c89" }, "recipient": {  "equals": "{user_eth_address}" } }, "take": 1 }"#.to_string()],
            query_settings: vec![r#"{"chainId": 10}"#.to_string()],
            processor: r#"return JSON.stringify(data.map((item) => item.value));"#.to_string(),
            output_schema: "uint256 score,uint32 scorer_id,uint8 score_decimals".to_string(),            
        });
    });
}
