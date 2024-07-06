use ic_cdk::query;

use crate::recipe::{self, Recipe};

#[query]
fn recipe_list() -> Result<Vec<Recipe>, String> {
    Ok(recipe::list())
}
