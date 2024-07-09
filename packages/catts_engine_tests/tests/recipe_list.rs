use candid::{encode_args, encode_one, Principal};
use catts_engine_tests::{
    common::{catts_query, catts_update, setup},
    recipes::recipe_eu_gtc_passport_clone,
    siwe::full_login,
    types::{Recipe, RpcResult},
};
use ic_agent::Identity;

#[test]
fn test_recipe_empty_list() {
    let (ic, _, catts) = setup();
    let response: RpcResult<Vec<Recipe>> = catts_query(
        &ic,
        catts,
        Principal::anonymous(),
        "recipe_list",
        encode_one(()).unwrap(),
    );
    assert!(response.is_ok());
    assert_eq!(response.unwrap_ok().len(), 0);
}

#[test]
fn test_recipe_list() {
    let (ic, siwe, catts) = setup();
    let (_, identity) = full_login(&ic, siwe, catts, None);
    let sender = identity.sender().unwrap();
    let response: RpcResult<Recipe> = catts_update(
        &ic,
        catts,
        sender,
        "recipe_create",
        encode_args(recipe_eu_gtc_passport_clone()).unwrap(),
    );
    assert!(response.is_ok());

    let response: RpcResult<Vec<Recipe>> =
        catts_query(&ic, catts, sender, "recipe_list", encode_one(()).unwrap());
    assert!(response.is_ok());
    assert_eq!(
        response.unwrap_ok().len(),
        1,
        "List should contain one recipe"
    );
}
