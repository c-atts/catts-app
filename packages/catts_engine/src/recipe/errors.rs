use thiserror::Error;

pub const MIN_NAME_LENGTH: usize = 3;
pub const MAX_NAME_LENGTH: usize = 50;

#[derive(Error, Debug)]
pub enum RecipeValidationError {
    #[error("Field cannot be empty: {0}")]
    FieldCannotBeEmpty(String),

    #[error("Only draft recipes can be updated")]
    OnlyDraftRecipesCanBeUpdated,

    #[error("slug cannot be changed once set")]
    SlugImmutable,

    #[error("creator cannot be changed once set")]
    CreatorImmutable,

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
