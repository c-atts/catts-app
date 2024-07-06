use crate::{RECIPES, RECIPE_ID_BY_SLUG};

use super::{Recipe, RecipeId};

pub fn get_by_id(recipe_id: &RecipeId) -> Option<Recipe> {
    RECIPES.with_borrow(|r| r.get(recipe_id).clone())
}

pub fn get_by_name(slug: &String) -> Option<Recipe> {
    RECIPE_ID_BY_SLUG.with_borrow(|r| r.get(slug).and_then(|id| get_by_id(&id)))
}

pub fn list() -> Vec<Recipe> {
    RECIPES.with_borrow(|r| r.iter().map(|(_, recipe)| recipe.clone()).collect())
}

pub fn save(recipe: &Recipe) {
    RECIPES.with(|r| {
        r.borrow_mut().insert(recipe.id, recipe.clone());
    });
}

// fn create_receipes_dir_if_not_exists() {
//     if !Path::new("recipes").exists() {
//         fs::create_dir("recipes").unwrap();
//     }
// }

// fn write_readme(slug: &str, contents: &str) {
//     fs::write(format!("recipes/{}/README.md", slug), contents).unwrap();
// }
