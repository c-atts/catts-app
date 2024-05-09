use crate::{
    error::Error,
    recipe::{Recipe, RecipeId},
};
use ic_cdk::query;

#[query]
async fn recipe_get_by_id(recipe_id: RecipeId) -> Result<Recipe, Error> {
    match Recipe::get_by_id(&recipe_id) {
        Some(recipe) => Ok(recipe),
        None => Err(Error::not_found("Recipe not found")),
    }
}
