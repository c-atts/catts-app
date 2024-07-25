use ic_cdk::update;

use crate::{
    http_error::HttpError,
    recipe::{self, Recipe, RecipeDetailsInput},
    user::auth_guard,
};

#[update]
pub fn recipe_create(details: RecipeDetailsInput, _readme: String) -> Result<Recipe, HttpError> {
    let address = auth_guard()?;
    let recipe = Recipe::new(&details, &address).map_err(HttpError::bad_request)?;
    recipe::create(&recipe).map_err(HttpError::conflict)
}
