use crate::{RECIPES, RECIPE_ID_BY_SLUG};

use super::{Recipe, RecipeId};

impl Recipe {
    pub fn get_by_id(recipe_id: &RecipeId) -> Option<Self> {
        RECIPES.with_borrow(|r| r.get(recipe_id).clone())
    }

    pub fn get_by_name(slug: &String) -> Option<Self> {
        RECIPE_ID_BY_SLUG.with_borrow(|r| r.get(slug).and_then(|id| Self::get_by_id(&id)))
    }

    pub fn list() -> Vec<Self> {
        RECIPES.with_borrow(|r| r.iter().map(|(_, recipe)| recipe.clone()).collect())
    }
}

// fn create_receipes_dir_if_not_exists() {
//     if !Path::new("recipes").exists() {
//         fs::create_dir("recipes").unwrap();
//     }
// }

// fn write_readme(slug: &str, contents: &str) {
//     fs::write(format!("recipes/{}/README.md", slug), contents).unwrap();
// }
