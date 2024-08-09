use ic_cdk::update;

use crate::{
    http_error::HttpError,
    recipe::{self, Recipe, RecipeDetailsInput},
    user::auth_guard,
};

#[update]
pub fn recipe_create(details: RecipeDetailsInput, readme: String) -> Result<Recipe, HttpError> {
    let address = auth_guard()?;
    let recipe = Recipe::new(&details, &address).map_err(HttpError::bad_request)?;
    let recipe = recipe::save(recipe).map_err(HttpError::conflict)?;
    recipe::write_readme(&recipe.name, &readme)
        .map_err(|_| HttpError::internal_server_error("Couldn't save README file."))?;
    Ok(recipe)
}
