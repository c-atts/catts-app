use crate::error::Error;
use crate::recipe::{Recipe, RecipeId};
use ic_cdk::query;

#[query]
async fn get_recipe(recipe_id: RecipeId) -> Result<Recipe, Error> {
    Recipe::get_by_id(&recipe_id).ok_or_else(|| Error::not_found("No recipe found"))
}
