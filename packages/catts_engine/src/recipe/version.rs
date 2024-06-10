use thiserror::Error;

pub struct Version {
    value: String,
}

#[derive(Debug, Error)]
pub enum VersionError {
    #[error("version cannot be empty")]
    Empty,

    #[error("version must be in the format 1.2.3")]
    InvalidFormat,
}

impl Version {
    pub fn new(value: &str) -> Result<Self, VersionError> {
        if value.is_empty() {
            return Err(VersionError::Empty);
        }

        // Validate version follows the semver format
        if value.split('.').count() != 3 {
            return Err(VersionError::InvalidFormat);
        }

        let parts: Vec<&str> = value.split('.').collect();
        for part in parts {
            if part.parse::<u8>().is_err() {
                return Err(VersionError::InvalidFormat);
            }
        }

        Ok(Self {
            value: value.to_string(),
        })
    }

    pub fn value(&self) -> &str {
        &self.value
    }
}
