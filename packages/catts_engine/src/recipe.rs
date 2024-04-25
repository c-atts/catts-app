use std::borrow::Cow;

use candid::{CandidType, Decode, Encode};
use ic_stable_structures::{storable::Bound, Storable};
use serde::{Deserialize, Serialize};

use crate::{eas::Uid, eth::EthAddressBytes, RECIPES};

type Query = String;
type QueryVariable = String;
type QuerySetting = String;
type Processor = String;

const MAX_VALUE_SIZE: u32 = 4096;

#[derive(Serialize, Deserialize, Debug, CandidType, Clone)]
pub struct Recipe {
    pub name: String,
    pub creator: EthAddressBytes,
    pub created: u64,
    pub version: String,
    pub description: Option<String>,
    pub keywords: Option<Vec<String>>,
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
    // pub fn _new(name: &str, version: &str) -> Self {
    //     Self {
    //         name: name.to_string(),
    //         version: version.to_string(),
    //         description: None,
    //         keywords: None,
    //         homepage: None,
    //         author: None,
    //         created: ic_cdk::api::time(),
    //         queries: vec![],
    //         query_variables: vec![],
    //         query_settings: vec![],
    //         processor: "".to_string(),
    //         output_schema: "".to_string(),
    //     }
    // }

    // pub fn _save(&self) {
    //     //TODO: Implement business rules
    //     // - Check if recipe already exists
    //     // - Check if recipe is valid
    //    // - Check string lengths

    //     RECIPES.with_borrow_mut(|recipes| {
    //         recipes.insert(self.name.clone(), self.clone());
    //     });
    // }

    pub fn get(name: &str) -> Option<Self> {
        RECIPES.with_borrow(|recipes| recipes.get(&name.to_string()))
    }

    pub fn _create(recipe: Self) {
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
        recipes.insert("gtc_passport_clone".to_string(), Recipe {
            name: "gtc_passport_clone".to_string(),
            creator: EthAddressBytes::from([0u8; 20]),
            created: ic_cdk::api::time(),
            version: "0.0.1".to_string(),
            description: Some("Make a copy of your Gitcoin Passport score to another chain.".to_string()),
            keywords: None,
            queries: vec!["query PassportQuery($where: AttestationWhereInput) { attestations(where: $where) { decodedDataJson }}".to_string()],
            query_variables: vec![r#"{ "where": { "schemaId": { "equals": "0x6ab5d34260fca0cfcf0e76e96d439cace6aa7c3c019d7c4580ed52c6845e9c89" }, "recipient": {  "equals": "{user_eth_address}" } }, "take": 1 }"#.to_string()],
            query_settings: vec![r#"{"chain_id": 10}"#.to_string()],
            processor: r#"
                if (!queryResult[0].attestations[0]) {
                    throw new Error("Couldn't find a Gitcoin Passport score for this address.");
                }
                const decodedDataJson = JSON.parse(queryResult[0].attestations[0].decodedDataJson);
                return JSON.stringify(decodedDataJson.map((item) => item.value));
            "#.to_string(),
            output_schema: "uint256 score,uint32 scorer_id,uint8 score_decimals".to_string(),            
        });
        recipes.insert("eu_gtc_passport_30".to_string(), Recipe {
            name: "eu_gtc_passport_30".to_string(),
            creator: EthAddressBytes::from([0u8; 20]),
            created: ic_cdk::api::time(),
            version: "0.0.1".to_string(),
            description: Some(r#"Creates an attestation if the following two criteria are met: 
            1. Gitcoin Passport score of 30 or more (Optimism)
            2. Coinbase, country of residence is in the EU (Base)"#.to_string()),
            keywords: None,
            queries: vec!["query PassportQuery($where: AttestationWhereInput) { attestations(where: $where) { decodedDataJson }}".to_string(), "query CountryQuery($where: AttestationWhereInput) { attestations(where: $where) { decodedDataJson }}".to_string()],
            query_variables: vec![r#"{ "where": { "schemaId": { "equals": "0x6ab5d34260fca0cfcf0e76e96d439cace6aa7c3c019d7c4580ed52c6845e9c89" }, "recipient": {  "equals": "{user_eth_address}" } }, "take": 1 }"#.to_string(), r#"{ "where": { "schemaId": { "equals": "0x1801901fabd0e6189356b4fb52bb0ab855276d84f7ec140839fbd1f6801ca065" }, "recipient": {  "equals": "{user_eth_address}" } }, "take": 1 }"#.to_string()],
            query_settings: vec![r#"{"chain_id": 10}"#.to_string(), r#"{"chain_id": 8453}"#.to_string()],
            processor: r#"
                if (!queryResult[0].attestations[0]) {
                    throw new Error("Couldn't find a Gitcoin Passport score for this address.");
                }
                if (!queryResult[0].attestations[1]) {
                    throw new Error("Couldn't find country of residence for this address.");
                }
                const euCountries = ['AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK'];
                const scoreHex = JSON.parse(queryResult[0].attestations[0].decodedDataJson)[0].value.value.hex; 
                const score = BigInt(scoreHex);
                const requiredScore = BigInt(30000000000000000000);
                const country = JSON.parse(queryResult[1].attestations[0].decodedDataJson)[0].value.value; 
                const eligible = euCountries.includes(country) && score >= requiredScore;
                if (!eligible) throw new Error("Not eligible for eu_gtc_passport_30");
                return JSON.stringify([{name: "eu_gtc_passport_30", type: "bool", value: true}]);        
            "#.to_string(),
            output_schema: "bool eu_gtc_passport_30".to_string(),            
        });
    });
}
