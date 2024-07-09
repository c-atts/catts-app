use ic_cdk::update;

use crate::{
    error::Error,
    recipe::{self, Recipe, RecipeId},
    user::auth_guard,
};

#[update]
fn recipe_publish(recipe_id: RecipeId) -> Result<Recipe, Error> {
    let address = auth_guard()?;
    let recipe = recipe::get_by_id(&recipe_id);
    if let Some(recipe) = recipe {
        if address.as_byte_array() != recipe.creator {
            return Err(Error::unauthorized(
                "You are not the author of this recipe.",
            ));
        }

        Ok(recipe::publish(&recipe_id).map_err(Error::bad_request)?)
    } else {
        Err(Error::not_found("Recipe not found."))
    }
}
