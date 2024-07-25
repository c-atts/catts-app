use crate::{
    http_error::HttpError,
    recipe::{self, Recipe, RecipeId},
};
use ic_cdk::query;

#[query]
fn recipe_get_by_id(id: RecipeId) -> Result<Recipe, HttpError> {
    recipe::get_by_id(&id).map_err(HttpError::not_found)
}
