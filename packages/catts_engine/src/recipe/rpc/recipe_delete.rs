use ic_cdk::update;

use crate::{
    http_error::HttpError,
    recipe::{self, Recipe, RecipeId, RecipePublishState},
    user::auth_guard,
};

#[update]
fn recipe_delete(recipe_id: RecipeId) -> Result<Recipe, HttpError> {
    let address = auth_guard()?;
    let recipe = recipe::get_by_id(&recipe_id).map_err(HttpError::not_found)?;

    if address.to_string() != recipe.creator {
        return Err(HttpError::unauthorized(
            "You are not the author of this recipe.",
        ));
    }

    if recipe.publish_state != RecipePublishState::Draft {
        return Err(HttpError::bad_request("You can only delete draft recipes."));
    }

    recipe::delete(&recipe_id).map_err(HttpError::bad_request)
}
