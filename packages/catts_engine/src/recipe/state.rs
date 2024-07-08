use thiserror::Error;

use crate::{RECIPES, RECIPE_NAME_INDEX};

use super::{Recipe, RecipeId, RecipePublishState};

#[derive(Error, Debug)]
pub enum RecipeError {
    #[error("Recipe not found")]
    NotFound,
}

pub fn get_by_id(recipe_id: &RecipeId) -> Option<Recipe> {
    RECIPES.with_borrow(|r| r.get(recipe_id).clone())
}

pub fn get_by_name(slug: &String) -> Option<Recipe> {
    RECIPE_NAME_INDEX.with_borrow(|r| r.get(slug).and_then(|id| get_by_id(&id)))
}

pub fn list() -> Vec<Recipe> {
    RECIPES.with_borrow(|r| r.iter().map(|(_, recipe)| recipe.clone()).collect())
}

#[derive(Error, Debug)]
pub enum SaveRecipeError {
    #[error("Only drafts can be updated")]
    NotDraft,
    #[error("Name already in use")]
    NameInUse,
}

pub fn create(recipe: &Recipe) -> Result<(), SaveRecipeError> {
    RECIPES.with_borrow_mut(|recipes| {
        let maybe_saved_recipe = recipes.get(&recipe.id).clone();

        if let Some(saved_recipe) = maybe_saved_recipe {
            if saved_recipe.publish_state != RecipePublishState::Draft {
                return Err(SaveRecipeError::NotDraft);
            }
        } else if RECIPE_NAME_INDEX.with_borrow(|index| index.contains_key(&recipe.name)) {
            return Err(SaveRecipeError::NameInUse);
        }

        recipes.insert(recipe.id, recipe.clone());

        RECIPE_NAME_INDEX.with_borrow_mut(|index| {
            index.insert(recipe.name.clone(), recipe.id);
        });

        Ok(())
    })
}

pub fn publish(recipe_id: &RecipeId) -> Result<Recipe, RecipeError> {
    RECIPES.with_borrow_mut(|recipes| {
        if let Some(mut recipe) = recipes.get(recipe_id) {
            recipe.publish_state = RecipePublishState::Published;
            Ok(recipe)
        } else {
            Err(RecipeError::NotFound)
        }
    })
}

// fn create_receipes_dir_if_not_exists() {
//     if !Path::new("recipes").exists() {
//         fs::create_dir("recipes").unwrap();
//     }
// }

// fn write_readme(slug: &str, contents: &str) {
//     fs::write(format!("recipes/{}/README.md", slug), contents).unwrap();
// }
