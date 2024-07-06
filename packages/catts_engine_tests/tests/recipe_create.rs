use candid::{decode_one, encode_args, Principal};
use catts_engine_tests::{
    common::{setup, should_be_401, update_call},
    recipes::recipe_eu_gtc_passport_clone,
    siwe::full_login,
    types::{Recipe, RpcResult},
};
use ic_agent::Identity;

#[test]
fn test_recipe_create_unauthorized() {
    let (ic, _, catts) = setup();
    let args = encode_args(recipe_eu_gtc_passport_clone()).unwrap();
    let response = update_call(&ic, catts, Principal::anonymous(), "recipe_create", args);
    let result: RpcResult<Recipe> = decode_one(&response).unwrap();
    should_be_401(result);
}

#[test]
fn test_recipe_create() {
    let (ic, siwe, catts) = setup();
    let (_, identity) = full_login(&ic, siwe, None);
    let args = encode_args(recipe_eu_gtc_passport_clone()).unwrap();
    let response = update_call(
        &ic,
        catts,
        identity.sender().unwrap(),
        "recipe_create",
        args,
    );
    let result: RpcResult<Recipe> = decode_one(&response).unwrap();
    assert!(result.is_ok());
}
