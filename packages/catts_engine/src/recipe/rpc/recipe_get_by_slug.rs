use crate::{error::Error, recipe::Recipe};
use ic_cdk::query;

#[query]
async fn recipe_get_by_name(name: String) -> Result<Recipe, Error> {
    match Recipe::get_by_name(&name) {
        Some(recipe) => Ok(recipe),
        None => Err(Error::not_found("Recipe not found")),
    }
}
