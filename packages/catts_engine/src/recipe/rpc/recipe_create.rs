use ic_cdk::update;

use crate::{
    error::Error,
    recipe::{self, Recipe, RecipeDetailsInput},
    user::auth_guard,
};

#[update]
pub fn recipe_create(details: RecipeDetailsInput, _readme: String) -> Result<Recipe, Error> {
    let address = auth_guard()?;
    let recipe = Recipe::new(&details, &address).map_err(Error::bad_request)?;
    recipe::create(&recipe).map_err(Error::conflict)
}
