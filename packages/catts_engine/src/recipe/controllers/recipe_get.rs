use crate::{error::Error, recipe::Recipe};
use ic_cdk::query;

#[query]
async fn recipe_get(recipe_id: [u8; 12]) -> Result<Recipe, Error> {
    match Recipe::get_by_id(&recipe_id) {
        Some(recipe) => Ok(recipe),
        None => Err(Error::not_found("Recipe not found")),
    }
}
