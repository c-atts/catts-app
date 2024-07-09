use crate::{
    error::Error,
    recipe::{self, Recipe, RecipeId},
};
use ic_cdk::query;

#[query]
fn recipe_get_by_id(id: RecipeId) -> Result<Recipe, Error> {
    match recipe::get_by_id(&id) {
        Some(recipe) => Ok(recipe),
        None => Err(Error::not_found("Recipe not found")),
    }
}
