use std::{fs, path::Path};

use crate::{
    change_log::{self, ChangeLogTypeName},
    RECIPES, RECIPE_NAME_INDEX,
};

use super::{Recipe, RecipeError, RecipeId, RecipePublishState};

pub fn get_by_id(recipe_id: &RecipeId) -> Result<Recipe, RecipeError> {
    RECIPES
        .with_borrow(|recipes| recipes.get(recipe_id).clone())
        .ok_or(RecipeError::NotFound)
}

pub fn get_by_name(name: &String) -> Result<Recipe, RecipeError> {
    let recipe_id = RECIPE_NAME_INDEX
        .with_borrow(|recipes| recipes.get(name))
        .ok_or(RecipeError::NotFound)?;
    get_by_id(&recipe_id)
}

pub fn list() -> Vec<Recipe> {
    RECIPES.with_borrow(|recipes| recipes.iter().map(|(_, recipe)| recipe.clone()).collect())
}

pub fn save(recipe: Recipe) -> Result<Recipe, RecipeError> {
    let saved_recipe_result = get_by_id(&recipe.id);

    let maybe_saved_recipe = match saved_recipe_result {
        Ok(ref recipe) => {
            if recipe.publish_state != RecipePublishState::Draft {
                return Err(RecipeError::NotDraft);
            }
            Ok(Some(recipe))
        }
        Err(RecipeError::NotFound) => {
            if RECIPE_NAME_INDEX.with_borrow(|index| index.contains_key(&recipe.name)) {
                return Err(RecipeError::NameInUse);
            }
            Ok(None)
        }
        Err(_) => Err(RecipeError::InternalError),
    }?;

    RECIPES.with_borrow_mut(|recipes| {
        recipes.insert(recipe.id, recipe.clone());
    });

    match maybe_saved_recipe {
        Some(saved_recipe) => {
            change_log::update(ChangeLogTypeName::Recipe, recipe.id, saved_recipe, &recipe)
                .unwrap();
        }
        None => {
            change_log::create(ChangeLogTypeName::Recipe, recipe.id, &recipe).unwrap();
        }
    }

    RECIPE_NAME_INDEX.with_borrow_mut(|index| {
        index.insert(recipe.name.clone(), recipe.id);
    });

    Ok(recipe)
}

pub fn publish(recipe_id: &RecipeId) -> Result<Recipe, RecipeError> {
    let mut recipe = get_by_id(recipe_id)?;
    recipe.publish_state = RecipePublishState::Published;
    save(recipe)
}

pub fn delete(recipe_id: &RecipeId) -> Result<Recipe, RecipeError> {
    let recipe = get_by_id(recipe_id)?;
    RECIPES.with_borrow_mut(|recipes| {
        recipes.remove(recipe_id);
    });
    RECIPE_NAME_INDEX.with_borrow_mut(|index| {
        index.remove(&recipe.name);
    });
    change_log::delete(ChangeLogTypeName::Recipe, recipe.id).unwrap();
    Ok(recipe)
}

pub fn write_readme(recipe_name: &str, contents: &str) -> Result<(), RecipeError> {
    fs::create_dir_all("recipes").map_err(|_| RecipeError::InternalError)?;
    fs::write(format!("recipes/{}/README.md", recipe_name), contents)
        .map_err(|_| RecipeError::InternalError)?;
    Ok(())
}

pub fn read_readme(recipe_name: &str) -> Result<String, RecipeError> {
    let path = format!("recipes/{}/README.md", recipe_name);
    if !Path::new(&path).exists() {
        return Err(RecipeError::NotFound);
    }
    fs::read_to_string(path).map_err(|_| RecipeError::InternalError)
}
