use thiserror::Error;

pub struct Slug {
    value: String,
}

const MIN_SLUG_LENGTH: usize = 3;
const MAX_SLUG_LENGTH: usize = 50;

#[derive(Debug, Error)]
pub enum SlugError {
    #[error("slug cannot be empty")]
    Empty,
    #[error(
        "slug length must be between {} and {} bytes",
        MIN_SLUG_LENGTH,
        MAX_SLUG_LENGTH
    )]
    Length,
    #[error("slug can only contain alphanumeric characters and hyphens")]
    InvalidCharacter,
}

impl Slug {
    pub fn new(value: &str) -> Result<Self, SlugError> {
        if value.is_empty() {
            return Err(SlugError::Empty);
        }

        if value.len() < MIN_SLUG_LENGTH || value.len() > MAX_SLUG_LENGTH {
            return Err(SlugError::Length);
        }

        if !value.chars().all(|c| c.is_ascii_alphanumeric() || c == '-') {
            return Err(SlugError::InvalidCharacter);
        }

        Ok(Self {
            value: value.to_lowercase(),
        })
    }

    pub fn value(&self) -> &str {
        &self.value
    }
}
