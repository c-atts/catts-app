use crate::{
    error::Error,
    recipe::{self, Recipe},
};
use ic_cdk::query;

#[query]
fn recipe_get_by_name(name: String) -> Result<Recipe, Error> {
    match recipe::get_by_name(&name) {
        Some(recipe) => Ok(recipe),
        None => Err(Error::not_found("Recipe not found")),
    }
}
