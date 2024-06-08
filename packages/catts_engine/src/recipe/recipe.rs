use std::borrow::Cow;

use crate::{
    eas::Uid,
    eth::{EthAddress, EthAddressBytes},
    RECIPES, RECIPE_ID_BY_NAME,
};
use blake2::digest::{Update, VariableOutput};
use blake2::Blake2bVar;
use candid::{CandidType, Decode, Encode, Nat};
use ic_stable_structures::{storable::Bound, Storable};
use serde::{Deserialize, Serialize};
use thiserror::Error;

type Query = String;
type QueryVariable = String;
type QuerySetting = String;
type Processor = String;

#[derive(Serialize, Deserialize, Debug)]
pub struct RecipeQuerySettings {
    pub query_type: String,
    pub eas_chain_id: Option<u32>,
    pub thegraph_query_url: Option<String>,
}

pub type RecipeId = [u8; 12];

#[derive(Error, Debug)]
pub enum RecipeError {
    // #[error("Name is too long, max length is 128 bytes")]
    // NameTooLong,
}

#[derive(Serialize, Deserialize, Debug, CandidType, Clone)]
pub struct Recipe {
    pub id: RecipeId,
    pub slug: String,
    pub display_name: String,
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
    pub gas: Nat,
}

impl Storable for Recipe {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Recipe {
    fn id(creator: &EthAddress, name: &str, version: &str) -> RecipeId {
        let mut hasher = Blake2bVar::new(12).unwrap();
        hasher.update(&creator.as_byte_array());
        hasher.update(name.as_bytes());
        hasher.update(version.as_bytes());
        let mut buf = [0u8; 12];
        hasher.finalize_variable(&mut buf).unwrap();
        buf
    }

    pub fn get_by_id(recipe_id: &RecipeId) -> Option<Self> {
        RECIPES.with_borrow(|r| r.get(recipe_id).clone())
    }

    pub fn get_by_name(name: &String) -> Option<Self> {
        RECIPE_ID_BY_NAME.with_borrow(|r| r.get(name).and_then(|id| Self::get_by_id(&id)))
    }

    pub fn list() -> Vec<Self> {
        RECIPES.with_borrow(|r| r.iter().map(|(_, recipe)| recipe.clone()).collect())
    }
}

pub fn init_recipes() {
    RECIPES.with_borrow_mut(|recipes| {
        RECIPE_ID_BY_NAME.with_borrow_mut(|recipe_id_by_name| {

            let creator = EthAddress::new("0xa32aECda752cF4EF89956e83d60C04835d4FA867").unwrap();
            let name = "gtc_passport_clone".to_string();
            let version = "0.0.1".to_string();
            let id = Recipe::id(&creator, &name, &version);

            recipes.insert(id, Recipe {
                id,
                slug: name.clone(),
                display_name: "Gitcoin Passport Clone".to_string(),
                creator: creator.as_byte_array(),
                created: ic_cdk::api::time(),
                version: version.clone(),
                description: Some("Make a copy of your Gitcoin Passport score to another chain.".to_string()),
                keywords: None,
                queries: vec!["query PassportQuery($where: AttestationWhereInput, $take: Int) { attestations(where: $where, take: $take) { decodedDataJson }}".to_string()],
                query_variables: vec![r#"{ "where": { "schemaId": { "equals": "0x6ab5d34260fca0cfcf0e76e96d439cace6aa7c3c019d7c4580ed52c6845e9c89" }, "recipient": {  "equals": "{user_eth_address}", "mode": "insensitive" } }, "take": 1 }"#.to_string()],
                query_settings: vec![r#"{ "query_type" : "eas", "eas_chain_id": 10 }"#.to_string()],
                processor: r#"
                    if (!queryResult[0].attestations[0]) {
                        throw new Error("Couldn't find a Gitcoin Passport score for this address.");
                    }
                    const decodedDataJson = JSON.parse(queryResult[0].attestations[0].decodedDataJson);
                    return JSON.stringify(decodedDataJson.map((item) => item.value));
                "#.to_string(),
                output_schema: "uint256 score,uint32 scorer_id,uint8 score_decimals".to_string(),
                gas: Nat::from(266_000_u32),
            });
            recipe_id_by_name.insert(name, id);


            let name = "ens_name_holder".to_string();
            let id = Recipe::id(&creator, &name, &version);

            recipes.insert(id, Recipe {
                id,
                slug: name.clone(),
                display_name: "ENS Name Holder".to_string(),
                creator: creator.as_byte_array(),
                created: ic_cdk::api::time(),
                version: version.clone(),
                description: Some(r#"Attests to the ownership of at least one ENS domain."#.to_string()),
                keywords: Some(vec!["ENS".to_string()]),
                queries: vec!["query getNamesForAddress($whereFilter: Domain_filter) { domains(where: $whereFilter) { labelName } }".to_string()],
                query_variables: vec![r#"{ "whereFilter":{ "or":[ { "owner":"{user_eth_address_lowercase}" }, { "registrant":"{user_eth_address_lowercase}" }, { "wrappedOwner":"{user_eth_address_lowercase}" } ] } }"#.to_string()],
                query_settings: vec![r#"{ "query_type" : "thegraph", "thegraph_query_url": "https://api.thegraph.com/subgraphs/name/ensdomains/ens" }"#.to_string()],
                processor: r#"
                    const domains = queryResult[0].domains;
                    if (!Array.isArray(domains) || domains.length === 0) {
                        throw new Error("You are not the owner of any ENS domains.");
                    }
                    return JSON.stringify([{name: "isEnsNameOwner", type: "bool", value: true}]);
                "#.to_string(),
                output_schema: "bool isEnsNameOwner".to_string(),
                gas: Nat::from(220_000_u32),
            });
            recipe_id_by_name.insert(name, id);

            let name = "eu_gtc_passport_30".to_string();
            let id = Recipe::id(&creator, &name, &version);

            recipes.insert(id, Recipe {
                id,
                slug: name.clone(),
                display_name: "EU Gitcoin Passport Score 30".to_string(),
                creator: creator.as_byte_array(),
                created: ic_cdk::api::time(),
                version: version.clone(),
                description: Some(r#"Creates an attestation if the following two criteria are met:
                1. Gitcoin Passport score of 30 or more (Optimism)
                2. Coinbase, country of residence is in the EU (Base)"#.to_string()),
                keywords: None,
                queries: vec!["query PassportQuery($where: AttestationWhereInput, $take: Int) { attestations(where: $where, take: $take) { decodedDataJson }}".to_string(), "query CountryQuery($where: AttestationWhereInput, $take: Int) { attestations(where: $where, take: $take) { decodedDataJson }}".to_string()],
                query_variables: vec![r#"{ "where": { "schemaId": { "equals": "0x6ab5d34260fca0cfcf0e76e96d439cace6aa7c3c019d7c4580ed52c6845e9c89" }, "recipient": {  "equals": "{user_eth_address}", "mode": "insensitive" } }, "take": 1 }"#.to_string(), r#"{ "where": { "schemaId": { "equals": "0x1801901fabd0e6189356b4fb52bb0ab855276d84f7ec140839fbd1f6801ca065" }, "recipient": {  "equals": "{user_eth_address}", "mode": "insensitive" } }, "take": 1 }"#.to_string()],
                query_settings: vec![r#"{ "query_type" : "eas", "eas_chain_id": 10 }"#.to_string(), r#"{ "query_type" : "eas", "eas_chain_id": 8453 }"#.to_string()],
                processor: r#"
                    if (!queryResult[0].attestations[0]) {
                        throw new Error("Couldn't find a Gitcoin Passport score for this address.");
                    }
                    if (!queryResult[1].attestations[0]) {
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
                gas: Nat::from(220_000_u32),
            });
            recipe_id_by_name.insert(name, id);

            let name = "ens_delegate".to_string();
            let id = Recipe::id(&creator, &name, &version);

            recipes.insert(id, Recipe {
                id,
                slug: name.clone(),
                display_name: "ENS Delegate".to_string(),
                creator: creator.as_byte_array(),
                created: ic_cdk::api::time(),
                version: version.clone(),
                description: Some("Attest to being an ENS delegate".to_string()),
                keywords: None,
                queries: vec!["query Delegate($id: ID!) { delegate(id: $id ) { numberVotes } }".to_string()],
                query_variables: vec![r#"{ "id": "{user_eth_address}" }"#.to_string()],
                query_settings: vec![r#"{ "query_type" : "thegraph", "thegraph_query_url": "https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/GyijYxW9yiSRcEd5u2gfquSvneQKi5QuvU3WZgFyfFSn" }"#.to_string()],
                processor: r#"
                    const delegate = queryResult[0].delegate;
                    if (!delegate) {
                        throw new Error("You are not an ENS delegate.");
                    }
                    return JSON.stringify([{name: "isEnsDelegate", type: "bool", value: true}]);
                "#.to_string(),
                output_schema: "bool isEnsDelegate".to_string(),
                gas: Nat::from(220_000_u32),
            });
            recipe_id_by_name.insert(name, id);

            let name = "armitage_contributor".to_string();
            let id = Recipe::id(&creator, &name, &version);

            recipes.insert(id, Recipe {
                id,
                slug: name.clone(),
                display_name: "Armitage Contributor".to_string(),
                creator: creator.as_byte_array(),
                created: ic_cdk::api::time(),
                version: version.clone(),
                description: Some(r#"Attests to active contributors to the Armitage project. Armitage tracks GitHub contributions using SourceCred. A SourceCred score of at least 100 is required for this attestation."#.to_string()),
                keywords: None,
                queries: vec!["query ArmitageContributorQuery($where: AttestationWhereInput) { attestations(where: $where) { decodedDataJson }}".to_string()],
                query_variables: vec![r#"{ "where": { "schemaId": { "equals": "0xdd55069b521b51585a2d09bed03cecde4524d4392683dc3c3c3cf09755a2a5b2" }, "attester": {  "equals": "{user_eth_address}", "mode": "insensitive" } } }"#.to_string()],
                query_settings: vec![r#"{ "query_type" : "eas", "eas_chain_id": 11155111 }"#.to_string()],
                processor: r#"
                    if (!queryResult[0].attestations[0]) {
                        throw new Error("Couldn't find any Armitage contributions for this address.");
                    }
                    const decodedDataJson = JSON.parse(queryResult[0].attestations[0].decodedDataJson);
                    const userCredScore = +decodedDataJson.find((item) => item.name === "userCredScore")?.value?.value;
                    if (userCredScore < 100) {
                        throw new Error("A cred score of 100 is required for this attestation.");
                    }
                    return JSON.stringify([{name: "armitage_contributor", type: "bool", value: true}]);
                "#.to_string(),
                output_schema: "bool armitage_contributor".to_string(),
                gas: Nat::from(220_000_u32),
            });
            recipe_id_by_name.insert(name, id);
        });
    });
}
