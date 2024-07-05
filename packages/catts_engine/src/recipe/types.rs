use candid::{CandidType, Decode, Encode, Nat};
use ic_stable_structures::{storable::Bound, Storable};
use serde::{Deserialize, Serialize};
use std::borrow::Cow;

use crate::{
    eas::Uid,
    eth::{EthAddress, EthAddressBytes},
};

use super::{generate_recipe_id, RecipeName, RecipeValidationError};

pub type RecipeId = [u8; 12];

#[derive(Serialize, Deserialize, Debug, CandidType, Clone, PartialEq)]
pub enum RecipePublishState {
    Draft,
    Published,
    Unpublished,
}

#[derive(Serialize, Deserialize, Debug, CandidType, Clone)]
pub struct RecipeQuery {
    pub endpoint: String,
    pub query: String,
    pub variables: String,
}

#[derive(Serialize, Deserialize, Debug, CandidType, Clone)]
pub struct Recipe {
    pub id: RecipeId,
    pub name: String,
    pub display_name: Option<String>,
    pub creator: EthAddressBytes,
    pub created: u64,
    pub description: Option<String>,
    pub keywords: Option<Vec<String>>,
    pub queries: Vec<RecipeQuery>,
    pub processor: String,
    pub schema: Uid,
    pub resolver: String,
    pub revokable: bool,
    pub gas: Option<Nat>,
    pub publish_state: RecipePublishState,
}

#[derive(Serialize, Deserialize, Debug, CandidType)]
pub struct RecipeDetailsInput {
    pub name: String,
    pub display_name: Option<String>,
    pub description: Option<String>,
    pub keywords: Option<Vec<String>>,
    pub queries: Vec<RecipeQuery>,
    pub processor: String,
    pub schema: String,
    pub resolver: String,
    pub revokable: bool,
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
    pub fn new(
        details: &RecipeDetailsInput,
        creator: &EthAddress,
    ) -> Result<Self, RecipeValidationError> {
        let name = RecipeName::new(&details.name)?;

        Ok(Self {
            id: generate_recipe_id(creator, &name),
            name: name.value().to_string(),
            display_name: details.display_name.clone(),
            creator: creator.as_byte_array(),
            created: ic_cdk::api::time(),
            description: details.description.clone(),
            keywords: details.keywords.clone(),
            queries: details.queries.clone(),
            processor: details.processor.clone(),
            schema: details.schema.clone(),
            resolver: details.resolver.clone(),
            revokable: details.revokable,
            gas: None,
            publish_state: RecipePublishState::Draft,
        })
    }
}
