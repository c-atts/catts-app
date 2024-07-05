use crate::{RECIPES, RECIPE_ID_BY_SLUG};

use super::{Recipe, RecipeId, RecipePublishState, RecipeValidationError};

impl Recipe {
    pub fn _save(&self) -> Result<(), RecipeValidationError> {
        RECIPES.with_borrow_mut(|recipes| {
            // Get previous version of recipe if it exists
            if let Some(saved_recipe) = recipes.get(&self.id) {
                // Only draft recipes can be updated
                if saved_recipe.publish_state != RecipePublishState::Draft {
                    return Err(RecipeValidationError::OnlyDraftRecipesCanBeUpdated);
                }

                // Slug cannot be changed
                if saved_recipe.name != self.name {
                    return Err(RecipeValidationError::SlugImmutable);
                }

                // Creator cannot be changed
                if saved_recipe.creator != self.creator {
                    return Err(RecipeValidationError::CreatorImmutable);
                }
            }

            // Save the recipe
            recipes.insert(self.id, self.clone());

            RECIPE_ID_BY_SLUG.with_borrow_mut(|recipe_id_by_slug| {
                recipe_id_by_slug.insert(self.name.clone(), self.id);
            });

            Ok(())
        })
    }

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
