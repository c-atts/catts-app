use candid::{decode_one, encode_args, Principal};
use catts_engine_tests::{
    common::{query_call, setup, update_call},
    recipes::recipe_eu_gtc_passport_clone,
    siwe::full_login,
    types::{Recipe, RpcResult},
};
use ic_agent::Identity;

#[test]
fn test_recipe_empty_list() {
    let (ic, _, catts) = setup();
    let response = query_call(&ic, catts, Principal::anonymous(), "recipe_list", vec![]);
    let result: RpcResult<Vec<Recipe>> = decode_one(&response).unwrap();
    assert!(result.is_ok());
    assert_eq!(result.unwrap_ok().len(), 0);
}

#[test]
fn test_recipe_list() {
    let (ic, siwe, catts) = setup();
    let (_, identity) = full_login(&ic, siwe, None);
    let sender = identity.sender().unwrap();
    let response = update_call(
        &ic,
        catts,
        sender,
        "recipe_create",
        encode_args(recipe_eu_gtc_passport_clone()).unwrap(),
    );
    let result: RpcResult<Recipe> = decode_one(&response).unwrap();
    assert!(result.is_ok());

    let response = query_call(&ic, catts, sender, "recipe_list", vec![]);
    let result: RpcResult<Vec<Recipe>> = decode_one(&response).unwrap();
    assert!(result.is_ok());
    assert_eq!(result.unwrap_ok().len(), 1);
}
