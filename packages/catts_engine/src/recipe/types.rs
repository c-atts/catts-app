use candid::{CandidType, Decode, Encode, Nat};
use ic_stable_structures::{storable::Bound, Storable};
use serde::{Deserialize, Serialize};
use std::borrow::Cow;
use validator::{Validate, ValidationError};
use validator_derive::Validate;

use crate::{
    eas::Uid,
    eth::{EthAddress, EthAddressBytes},
};

use super::generate_recipe_id;

pub type RecipeId = [u8; 12];

#[derive(Serialize, Deserialize, Debug, CandidType, Clone, PartialEq)]
pub enum RecipePublishState {
    Draft,
    Published,
    Unpublished,
}

#[derive(Serialize, Deserialize, Debug, CandidType, Clone, Validate)]
pub struct RecipeQuery {
    #[validate(length(min = 1, max = 255))]
    pub endpoint: String,

    #[validate(length(min = 1, max = 1024))]
    pub query: String,

    #[validate(length(min = 1, max = 1024))]
    pub variables: String,
}

#[derive(Serialize, Deserialize, Debug, CandidType, Clone, Validate)]
pub struct Recipe {
    pub id: RecipeId,

    // validate_recipe_name: only lowercase alphanumeric letters and hyphens
    #[validate(length(min = 3, max = 50), custom(function = "validate_recipe_name"))]
    pub name: String,

    #[validate(length(min = 3, max = 50))]
    pub display_name: Option<String>,

    // Assuming EthAddressBytes and Uid have validations
    pub creator: EthAddressBytes,
    pub created: u64,

    #[validate(length(min = 3, max = 160))]
    pub description: Option<String>,

    // validate_keywords: length between 3 and 50, not empty, alphanumeric letters and hyphens, lowercase
    #[validate(custom(function = "validate_keywords"))]
    pub keywords: Option<Vec<String>>,

    #[validate(nested)]
    pub queries: Vec<RecipeQuery>,

    #[validate(length(min = 1, max = 1024))]
    pub processor: String,

    #[validate(length(min = 1, max = 512))]
    pub schema: Uid,

    #[validate(length(equal = 42))]
    pub resolver: String,

    pub revokable: bool,
    pub gas: Option<Nat>,
    pub publish_state: RecipePublishState,
}

fn validate_recipe_name(name: &str) -> Result<(), ValidationError> {
    if !name
        .chars()
        .all(|c| c.is_ascii_lowercase() && c.is_ascii_alphanumeric() || c == '-')
    {
        return Err(ValidationError::new(
            "Name must be lowercase and can only contain alphanumeric characters and hyphens",
        ));
    }

    Ok(())
}

fn validate_keywords(keywords: &[String]) -> Result<(), ValidationError> {
    if keywords.is_empty() {
        return Err(ValidationError::new("Keywords must not be empty"));
    }

    for keyword in keywords {
        if keyword.len() < 3 || keyword.len() > 50 {
            return Err(ValidationError::new("length"));
        }

        if !keyword
            .chars()
            .all(|c| c.is_ascii_lowercase() && c.is_ascii_alphanumeric() || c == '-')
        {
            return Err(ValidationError::new(
                "Keywords must be lowercase and can only contain alphanumeric characters and hyphens",
            ));
        }
    }
    Ok(())
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
    ) -> Result<Self, validator::ValidationErrors> {
        let recipe = Self {
            id: generate_recipe_id(creator, details.name.as_str()),
            name: details.name.clone(),
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
        };

        recipe.validate()?;

        Ok(recipe)
    }
}
