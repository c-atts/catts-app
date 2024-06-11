mod common;

use candid::{decode_one, encode_one, CandidType, Principal};
use common::{setup, Result};
use pocket_ic::WasmResult;
use serde::{Deserialize, Serialize};

pub type EthAddressBytes = [u8; 20];
pub type RecipeId = [u8; 12];
type Query = String;
type QueryVariable = String;
type QuerySetting = String;
type Processor = String;
pub type Uid = String;

#[derive(Serialize, Deserialize, Debug, CandidType, Clone, PartialEq)]
pub enum RecipePublishState {
    Draft,
    Published,
    Unpublished,
}

#[derive(Serialize, Deserialize, Debug, CandidType, Clone)]
pub struct Recipe {
    pub id: RecipeId,
    pub slug: String,
    pub display_name: Option<String>,
    pub creator: EthAddressBytes,
    pub created: u64,
    pub version: String,
    pub description: Option<String>,
    pub keywords: Option<Vec<String>>,
    pub queries: Option<Vec<Query>>,
    pub query_variables: Option<Vec<QueryVariable>>,
    pub query_settings: Option<Vec<QuerySetting>>,
    pub processor: Option<Processor>,
    pub output_schema: Option<Uid>,
    pub gas: Option<candid::Nat>,
    pub publish_state: RecipePublishState,
}

#[test]
fn test_recipe_list() {
    let (pic, catts) = setup();

    let Ok(WasmResult::Reply(response)) = pic.query_call(
        catts,
        Principal::anonymous(),
        "recipe_list",
        encode_one(()).unwrap(),
    ) else {
        panic!("Expected reply");
    };

    let result: Result<Vec<Recipe>> = decode_one(&response).unwrap();

    match result {
        Result::Ok(recipes) => {
            assert_ne!(recipes.len(), 0);
        }
        Result::Err(e) => {
            panic!("Expected Ok, got Err: {}", e);
        }
    }
}
