use ic_cdk::query;

use crate::recipe::Recipe;

#[query]
fn list_recipes() -> Result<Vec<Recipe>, String> {
    Ok(Recipe::list())
}
