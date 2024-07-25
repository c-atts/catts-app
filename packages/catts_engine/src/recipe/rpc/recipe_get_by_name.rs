use crate::{
    http_error::HttpError,
    recipe::{self, Recipe},
};
use ic_cdk::query;

#[query]
fn recipe_get_by_name(name: String) -> Result<Recipe, HttpError> {
    match recipe::get_by_name(&name) {
        Some(recipe) => Ok(recipe),
        None => Err(HttpError::not_found("Recipe not found")),
    }
}
