use crate::{
    http_error::HttpError,
    recipe::{self, Recipe},
};
use ic_cdk::query;

#[query]
fn recipe_get_by_name(name: String) -> Result<Recipe, HttpError> {
    recipe::get_by_name(&name).map_err(HttpError::not_found)
}
