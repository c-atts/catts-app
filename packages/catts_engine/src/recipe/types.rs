use crate::{
    eth_address::EthAddress,
    json::{bytes_to_hex_string_value, ToJsonValue},
    time::time,
};
use candid::{CandidType, Decode, Encode};
use core::fmt;
use ic_stable_structures::{storable::Bound, Storable};
use regex::Regex;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::borrow::Cow;
use thiserror::Error;
use validator::{Validate, ValidationError};
use validator_derive::Validate;

use super::generate_recipe_id;

pub type RecipeId = [u8; 12];

#[derive(Error, Debug)]
pub enum RecipeError {
    #[error("Only drafts can be updated")]
    NotDraft,
    #[error("Name already in use")]
    NameInUse,
    #[error("Recipe not found")]
    NotFound,
    #[error("Internal error")]
    InternalError,
}

#[derive(Serialize, Deserialize, CandidType, Clone, PartialEq)]
pub enum RecipePublishState {
    Draft,
    Published,
    Unpublished,
}

impl fmt::Display for RecipePublishState {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            RecipePublishState::Draft => "Draft",
            RecipePublishState::Published => "Published",
            RecipePublishState::Unpublished => "Unpublished",
        };
        write!(f, "{}", s)
    }
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

#[derive(Serialize, Deserialize, CandidType, Clone, Validate)]
pub struct Recipe {
    pub id: RecipeId,

    // validate_recipe_name: only lowercase alphanumeric letters and hyphens
    #[validate(length(min = 3, max = 50), custom(function = "validate_recipe_name"))]
    pub name: String,

    #[validate(length(min = 3, max = 50))]
    pub display_name: Option<String>,

    #[validate(length(equal = 42))]
    pub creator: String,

    pub created: u32,

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
    pub schema: String,

    #[validate(length(equal = 42))]
    pub resolver: String,

    pub revokable: bool,
    pub publish_state: RecipePublishState,
}

/// Only lowercase letters (a-z), digits (0-9), and hyphens (-) are allowed.
/// The name must not start or end with a hyphen.
/// The name must not start with a digit.
fn validate_recipe_name(name: &str) -> Result<(), ValidationError> {
    if name.starts_with('-') || name.ends_with('-') || name.chars().next().unwrap().is_numeric() {
        return Err(ValidationError::new(
            "Name must not start or end with a hyphen and must not start with a number",
        ));
    }

    let re = Regex::new(r"^[a-z0-9-]+$").unwrap();

    if !re.is_match(name) {
        return Err(ValidationError::new(
            "Name must be lowercase, alphanumeric, and may contain hyphens",
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

impl Storable for Recipe {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl ToJsonValue for Recipe {
    fn to_json_value(&self) -> Value {
        let mut obj = serde_json::Map::new();

        obj.insert("id".to_string(), bytes_to_hex_string_value(&self.id));
        obj.insert("name".to_string(), json!(self.name));
        if let Some(ref display_name) = self.display_name {
            obj.insert("display_name".to_string(), json!(display_name));
        }
        obj.insert("creator".to_string(), json!(self.creator));
        obj.insert("created".to_string(), json!(self.created));
        if let Some(ref description) = self.description {
            obj.insert("description".to_string(), json!(description));
        }
        if let Some(ref keywords) = self.keywords {
            obj.insert("keywords".to_string(), json!(keywords));
        }
        obj.insert("queries".to_string(), json!(self.queries));
        obj.insert("processor".to_string(), json!(self.processor));
        obj.insert("schema".to_string(), json!(self.schema));
        obj.insert("resolver".to_string(), json!(self.resolver));
        obj.insert("revokable".to_string(), json!(self.revokable));
        obj.insert(
            "publish_state".to_string(),
            json!(format!("{}", self.publish_state)),
        );

        Value::Object(obj)
    }
}

impl ToJsonValue for &Recipe {
    fn to_json_value(&self) -> Value {
        (*self).to_json_value()
    }
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
            creator: creator.to_string(),
            created: time(),
            description: details.description.clone(),
            keywords: details.keywords.clone(),
            queries: details.queries.clone(),
            processor: details.processor.clone(),
            schema: details.schema.clone(),
            resolver: details.resolver.clone(),
            revokable: details.revokable,
            publish_state: RecipePublishState::Draft,
        };

        recipe.validate()?;

        Ok(recipe)
    }
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
