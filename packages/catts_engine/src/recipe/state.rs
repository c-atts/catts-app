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

pub fn get_by_name(slug: &String) -> Result<Recipe, RecipeError> {
    let recipe_id = RECIPE_NAME_INDEX
        .with_borrow(|recipes| recipes.get(slug))
        .ok_or(RecipeError::NotFound)?;
    get_by_id(&recipe_id)
}

pub fn list() -> Vec<Recipe> {
    RECIPES.with_borrow(|recipes| recipes.iter().map(|(_, recipe)| recipe.clone()).collect())
}

pub fn save(recipe: Recipe) -> Result<Recipe, RecipeError> {
    let saved_recipe_result = get_by_id(&recipe.id);

    match saved_recipe_result {
        Ok(saved_recipe) => {
            if saved_recipe.publish_state != RecipePublishState::Draft {
                return Err(RecipeError::NotDraft);
            }
        }
        Err(RecipeError::NotFound) => {
            if RECIPE_NAME_INDEX.with_borrow(|index| index.contains_key(&recipe.name)) {
                return Err(RecipeError::NameInUse);
            }
        }
        Err(_) => (),
    }

    RECIPES.with_borrow_mut(|recipes| {
        recipes.insert(recipe.id, recipe.clone());
    });

    change_log::create(ChangeLogTypeName::Recipe, recipe.id, &recipe).unwrap();

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

// fn create_receipes_dir_if_not_exists() {
//     if !Path::new("recipes").exists() {
//         fs::create_dir("recipes").unwrap();
//     }
// }

// fn write_readme(slug: &str, contents: &str) {
//     fs::write(format!("recipes/{}/README.md", slug), contents).unwrap();
// }
