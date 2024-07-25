use ic_cdk::update;

use crate::{
    http_error::HttpError,
    recipe::{self, Recipe, RecipeId},
    user::auth_guard,
};

#[update]
fn recipe_publish(recipe_id: RecipeId) -> Result<Recipe, HttpError> {
    let address = auth_guard()?;
    let recipe = recipe::get_by_id(&recipe_id);
    if let Some(recipe) = recipe {
        if address.as_byte_array() != recipe.creator {
            return Err(HttpError::unauthorized(
                "You are not the author of this recipe.",
            ));
        }

        Ok(recipe::publish(&recipe_id).map_err(HttpError::bad_request)?)
    } else {
        Err(HttpError::not_found("Recipe not found."))
    }
}
