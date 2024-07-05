use ic_cdk::update;

use crate::{
    error::Error,
    recipe::{Recipe, RecipeDetailsInput},
    siwe::get_authenticated_eth_address,
};

#[update]
pub async fn recipe_create(details: RecipeDetailsInput, _readme: String) -> Result<Recipe, Error> {
    let address = get_authenticated_eth_address().await?;
    let recipe = Recipe::new(&details, &address).map_err(Error::bad_request)?;
    Ok(recipe)
}
