use candid::{encode_args, encode_one};
use catts_engine_tests::{
    common::{catts_update, setup},
    recipes::recipe_eu_gtc_passport_clone,
    siwe::full_login,
    types::{Recipe, RecipePublishState, RpcResult},
};
use ic_agent::Identity;

#[test]
fn recipe_publish() {
    let (ic, siwe, catts) = setup();
    let (_, identity) = full_login(&ic, siwe, catts, None);
    let create_response: RpcResult<Recipe> = catts_update(
        &ic,
        catts,
        identity.sender().unwrap(),
        "recipe_create",
        encode_args(recipe_eu_gtc_passport_clone()).unwrap(),
    );
    let recipe = create_response.unwrap_ok();
    let publish_response: RpcResult<Recipe> = catts_update(
        &ic,
        catts,
        identity.sender().unwrap(),
        "recipe_publish",
        encode_one(recipe.id).unwrap(),
    );
    let updated_recipe = publish_response.unwrap_ok();
    assert_eq!(updated_recipe.publish_state, RecipePublishState::Published);
}

#[test]
fn recipe_publish_unauthorized() {
    let (ic, siwe, catts) = setup();
    let (_, identity) = full_login(&ic, siwe, catts, None);
    let create_response: RpcResult<Recipe> = catts_update(
        &ic,
        catts,
        identity.sender().unwrap(),
        "recipe_create",
        encode_args(recipe_eu_gtc_passport_clone()).unwrap(),
    );
    let recipe = create_response.unwrap_ok();
    let (_, identity2) = full_login(&ic, siwe, catts, None);
    let publish_response: RpcResult<Recipe> = catts_update(
        &ic,
        catts,
        identity2.sender().unwrap(),
        "recipe_publish",
        encode_one(recipe.id).unwrap(),
    );
    let error = publish_response.unwrap_err();
    assert_eq!(error.code, 401);
}

#[test]
fn recipe_publish_not_found() {
    let (ic, siwe, catts) = setup();
    let (_, identity) = full_login(&ic, siwe, catts, None);
    let id_not_found = [0u8; 12];
    let publish_response: RpcResult<Recipe> = catts_update(
        &ic,
        catts,
        identity.sender().unwrap(),
        "recipe_publish",
        encode_one(id_not_found).unwrap(),
    );
    let error = publish_response.unwrap_err();
    assert_eq!(error.code, 404);
}
