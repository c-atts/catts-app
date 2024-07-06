use thiserror::Error;

pub const MIN_NAME_LENGTH: usize = 3;
pub const MAX_NAME_LENGTH: usize = 50;

#[derive(Error, Debug)]
pub enum RecipeValidationError {
    #[error("Name cannot be empty")]
    Empty,
    #[error(
        "Name length must be between {} and {} bytes",
        MIN_NAME_LENGTH,
        MAX_NAME_LENGTH
    )]
    Length,
    #[error("Name can only contain alphanumeric characters and hyphens")]
    InvalidCharacter,
}
