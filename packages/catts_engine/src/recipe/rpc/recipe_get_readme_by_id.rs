use crate::{
    http_error::HttpError,
    recipe::{self, RecipeId},
};
use ic_cdk::query;

#[query]
fn recipe_get_readme_by_id(id: RecipeId) -> Result<String, HttpError> {
    let recipe = recipe::get_by_id(&id).map_err(HttpError::not_found)?;
    recipe::read_readme(&recipe.name)
        .map_err(|_| HttpError::internal_server_error("Couldn't read README file."))
}
