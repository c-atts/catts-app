use ic_cdk::query;

use crate::recipe::Recipe;

#[query]
fn recipe_list() -> Result<Vec<Recipe>, String> {
    Ok(Recipe::list())
}
