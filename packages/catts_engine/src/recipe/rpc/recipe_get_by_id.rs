use crate::{
    http_error::HttpError,
    recipe::{self, Recipe, RecipeId},
};
use ic_cdk::query;

#[query]
fn recipe_get_by_id(id: RecipeId) -> Result<Recipe, HttpError> {
    match recipe::get_by_id(&id) {
        Some(recipe) => Ok(recipe),
        None => Err(HttpError::not_found("Recipe not found")),
    }
}
