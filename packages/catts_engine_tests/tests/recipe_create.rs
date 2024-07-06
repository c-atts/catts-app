use candid::{encode_args, Principal};
use catts_engine_tests::{
    common::{catts_update, setup},
    recipes::recipe_eu_gtc_passport_clone,
    siwe::full_login,
    types::{Recipe, RpcResult},
};
use ic_agent::Identity;

#[test]
fn test_recipe_create_unauthorized() {
    let (ic, _, catts) = setup();
    let args = encode_args(recipe_eu_gtc_passport_clone()).unwrap();
    let response: RpcResult<Recipe> =
        catts_update(&ic, catts, Principal::anonymous(), "recipe_create", args);

    assert!(response.is_err());
    assert!(matches!(response.unwrap_err().code, 401));
}

#[test]
fn test_recipe_create() {
    ic_cdk::println!("WTF");
    let (ic, siwe, catts) = setup();
    let (_, identity) = full_login(&ic, siwe, None);
    let args = encode_args(recipe_eu_gtc_passport_clone()).unwrap();
    let response: RpcResult<Recipe> = catts_update(
        &ic,
        catts,
        identity.sender().unwrap(),
        "recipe_create",
        args,
    );

    assert!(response.is_ok());
}
