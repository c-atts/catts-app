use crate::{
    http_error::HttpError,
    recipe::{self},
};
use ic_cdk::query;

#[query]
fn recipe_get_readme_by_name(recipe_name: String) -> Result<String, HttpError> {
    recipe::read_readme(&recipe_name)
        .map_err(|_| HttpError::internal_server_error("Couldn't read README file."))
}
