use crate::recipe::{RecipeValidationError, MAX_NAME_LENGTH, MIN_NAME_LENGTH};

pub struct RecipeName {
    value: String,
}

impl RecipeName {
    pub fn new(value: &str) -> Result<Self, RecipeValidationError> {
        if value.is_empty() {
            return Err(RecipeValidationError::Empty);
        }

        if value.len() < MIN_NAME_LENGTH || value.len() > MAX_NAME_LENGTH {
            return Err(RecipeValidationError::Length);
        }

        if !value.chars().all(|c| c.is_ascii_alphanumeric() || c == '-') {
            return Err(RecipeValidationError::InvalidCharacter);
        }

        Ok(Self {
            value: value.to_lowercase(),
        })
    }

    pub fn value(&self) -> &str {
        &self.value
    }
}
