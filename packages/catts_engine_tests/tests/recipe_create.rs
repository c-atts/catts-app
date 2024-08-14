use candid::{encode_args, encode_one, Principal};
use catts_engine_tests::{
    assert_starts_with,
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
    let (ic, siwe, catts) = setup();
    let (_, identity) = full_login(&ic, siwe, catts, None);
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

#[test]
fn recipe_create_name_too_short() {
    let (ic, siwe, catts) = setup();
    let (_, identity) = full_login(&ic, siwe, catts, None);
    let mut args = recipe_eu_gtc_passport_clone();
    args.0.name = "a".to_string();
    let args = encode_args(args).unwrap();
    let response: RpcResult<Recipe> = catts_update(
        &ic,
        catts,
        identity.sender().unwrap(),
        "recipe_create",
        args,
    );
    assert!(response.is_err());
    let error = response.unwrap_err();
    assert_eq!(error.code, 400);
    let details = error.details.as_deref().expect("No error details found");
    assert_starts_with!(details, "name: Validation error: length".to_string())
}

#[test]
fn recipe_create_name_too_long() {
    let (ic, siwe, catts) = setup();
    let (_, identity) = full_login(&ic, siwe, catts, None);
    let mut args = recipe_eu_gtc_passport_clone();
    args.0.name = "a".repeat(51).to_string();
    let args = encode_args(args).unwrap();
    let response: RpcResult<Recipe> = catts_update(
        &ic,
        catts,
        identity.sender().unwrap(),
        "recipe_create",
        args,
    );
    assert!(response.is_err());
    let error = response.unwrap_err();
    assert_eq!(error.code, 400);
    let details = error.details.as_deref().expect("No error details found");
    assert_starts_with!(details, "name: Validation error: length".to_string());
}

#[test]
fn recipe_create_name_invalid_characters() {
    let (ic, siwe, catts) = setup();
    let (_, identity) = full_login(&ic, siwe, catts, None);
    let mut args = recipe_eu_gtc_passport_clone();
    args.0.name = "#€#€#€".to_string();
    let args = encode_args(args).unwrap();
    let response: RpcResult<Recipe> = catts_update(
        &ic,
        catts,
        identity.sender().unwrap(),
        "recipe_create",
        args,
    );
    assert!(response.is_err());
    let error = response.unwrap_err();
    assert_eq!(error.code, 400);
    let details = error.details.as_deref().expect("No error details found");
    assert_starts_with!(
        details,
        "name: Validation error: Name must be lowercase and can only contain alphanumeric characters and hyphens".to_string()
    );
}

#[test]
fn recipe_create_name_uppercase() {
    let (ic, siwe, catts) = setup();
    let (_, identity) = full_login(&ic, siwe, catts, None);
    let mut args = recipe_eu_gtc_passport_clone();
    args.0.name = "UPPERCASE-NOT-ALLOWED".to_string();
    let args = encode_args(args).unwrap();
    let response: RpcResult<Recipe> = catts_update(
        &ic,
        catts,
        identity.sender().unwrap(),
        "recipe_create",
        args,
    );
    assert!(response.is_err());
    let error = response.unwrap_err();
    assert_eq!(error.code, 400);
    let details = error.details.as_deref().expect("No error details found");
    assert_starts_with!(
         details,
         "name: Validation error: Name must be lowercase and can only contain alphanumeric characters and hyphens".to_string()
     );
}

#[test]
fn recipe_create_description_too_short() {
    let (ic, siwe, catts) = setup();
    let (_, identity) = full_login(&ic, siwe, catts, None);
    let mut args = recipe_eu_gtc_passport_clone();
    args.0.description = Some("a".to_string());
    let args = encode_args(args).unwrap();
    let response: RpcResult<Recipe> = catts_update(
        &ic,
        catts,
        identity.sender().unwrap(),
        "recipe_create",
        args,
    );
    assert!(response.is_err());
    let error = response.unwrap_err();
    assert_eq!(error.code, 400);
    let details = error.details.as_deref().expect("No error details found");
    assert_starts_with!(details, "description: Validation error: length".to_string());
}

#[test]
fn recipe_create_description_too_long() {
    let (ic, siwe, catts) = setup();
    let (_, identity) = full_login(&ic, siwe, catts, None);
    let mut args = recipe_eu_gtc_passport_clone();
    args.0.description = Some("a".repeat(161).to_string());
    let args = encode_args(args).unwrap();
    let response: RpcResult<Recipe> = catts_update(
        &ic,
        catts,
        identity.sender().unwrap(),
        "recipe_create",
        args,
    );
    assert!(response.is_err());
    let error = response.unwrap_err();
    assert_eq!(error.code, 400);
    let details = error.details.as_deref().expect("No error details found");
    assert_starts_with!(details, "description: Validation error: length".to_string());
}

#[test]
fn recipe_create_keywords_empty() {
    let (ic, siwe, catts) = setup();
    let (_, identity) = full_login(&ic, siwe, catts, None);
    let mut args = recipe_eu_gtc_passport_clone();
    args.0.keywords = Some(vec![]);
    let args = encode_args(args).unwrap();
    let response: RpcResult<Recipe> = catts_update(
        &ic,
        catts,
        identity.sender().unwrap(),
        "recipe_create",
        args,
    );
    assert!(response.is_err());
    let error = response.unwrap_err();
    assert_eq!(error.code, 400);
    let details = error.details.as_deref().expect("No error details found");
    assert_starts_with!(
        details,
        "keywords: Validation error: Keywords must not be empty".to_string()
    );
}

#[test]
fn recipe_create_keywords_keyword_too_short() {
    let (ic, siwe, catts) = setup();
    let (_, identity) = full_login(&ic, siwe, catts, None);
    let mut args = recipe_eu_gtc_passport_clone();
    args.0.keywords = Some(vec!["a".to_string()]);
    let args = encode_args(args).unwrap();
    let response: RpcResult<Recipe> = catts_update(
        &ic,
        catts,
        identity.sender().unwrap(),
        "recipe_create",
        args,
    );
    assert!(response.is_err());
    let error = response.unwrap_err();
    assert_eq!(error.code, 400);
    let details = error.details.as_deref().expect("No error details found");
    assert_starts_with!(details, "keywords: Validation error: length".to_string());
}

#[test]
fn recipe_create_keywords_keyword_too_long() {
    let (ic, siwe, catts) = setup();
    let (_, identity) = full_login(&ic, siwe, catts, None);
    let mut args = recipe_eu_gtc_passport_clone();
    args.0.keywords = Some(vec!["a".repeat(51).to_string()]);
    let args = encode_args(args).unwrap();
    let response: RpcResult<Recipe> = catts_update(
        &ic,
        catts,
        identity.sender().unwrap(),
        "recipe_create",
        args,
    );
    assert!(response.is_err());
    let error = response.unwrap_err();
    assert_eq!(error.code, 400);
    let details = error.details.as_deref().expect("No error details found");
    assert_starts_with!(details, "keywords: Validation error: length".to_string());
}

#[test]
fn recipe_creata_keywords_invalid_characters() {
    let (ic, siwe, catts) = setup();
    let (_, identity) = full_login(&ic, siwe, catts, None);
    let mut args = recipe_eu_gtc_passport_clone();
    args.0.keywords = Some(vec!["a b".to_string()]);
    let args = encode_args(args).unwrap();
    let response: RpcResult<Recipe> = catts_update(
        &ic,
        catts,
        identity.sender().unwrap(),
        "recipe_create",
        args,
    );
    assert!(response.is_err());
    let error = response.unwrap_err();
    assert_eq!(error.code, 400);
    let details = error.details.as_deref().expect("No error details found");
    assert_starts_with!(
        details,
        "keywords: Validation error: Keywords must be lowercase and can only contain alphanumeric characters and hyphens".to_string()
    );
}

#[test]
fn recipe_create_resolver_too_short() {
    let (ic, siwe, catts) = setup();
    let (_, identity) = full_login(&ic, siwe, catts, None);
    let mut args = recipe_eu_gtc_passport_clone();
    args.0.resolver = "a".to_string();
    let args = encode_args(args).unwrap();
    let response: RpcResult<Recipe> = catts_update(
        &ic,
        catts,
        identity.sender().unwrap(),
        "recipe_create",
        args,
    );
    assert!(response.is_err());
    let error = response.unwrap_err();
    assert_eq!(error.code, 400);
    let details = error.details.as_deref().expect("No error details found");
    assert_starts_with!(details, "resolver: Validation error: length".to_string());
}

#[test]
fn recipe_create_resolver_too_long() {
    let (ic, siwe, catts) = setup();
    let (_, identity) = full_login(&ic, siwe, catts, None);
    let mut args = recipe_eu_gtc_passport_clone();
    args.0.resolver = "a".repeat(43).to_string();
    let args = encode_args(args).unwrap();
    let response: RpcResult<Recipe> = catts_update(
        &ic,
        catts,
        identity.sender().unwrap(),
        "recipe_create",
        args,
    );
    assert!(response.is_err());
    let error = response.unwrap_err();
    assert_eq!(error.code, 400);
    let details = error.details.as_deref().expect("No error details found");
    assert_starts_with!(details, "resolver: Validation error: length".to_string());
}

#[test]
fn recipe_create_name_already_exists() {
    let (ic, siwe, catts) = setup();
    let (_, identity) = full_login(&ic, siwe, catts, None);
    let recipe = recipe_eu_gtc_passport_clone();
    let args = encode_args(recipe).unwrap();
    let response: RpcResult<Recipe> = catts_update(
        &ic,
        catts,
        identity.sender().unwrap(),
        "recipe_create",
        args.clone(),
    );
    assert!(response.is_ok());

    let (_, identity2) = full_login(&ic, siwe, catts, None);
    let response: RpcResult<Recipe> = catts_update(
        &ic,
        catts,
        identity2.sender().unwrap(),
        "recipe_create",
        args,
    );
    assert!(response.is_err());
    let error = response.unwrap_err();
    assert_eq!(error.code, 409);
    let details = error.details.as_deref().expect("No error details found");
    assert_eq!(details, "Name already in use");
}

#[test]
fn recipe_create_already_published() {
    let (ic, siwe, catts) = setup();
    let (_, identity) = full_login(&ic, siwe, catts, None);
    let recipe = recipe_eu_gtc_passport_clone();
    let args = encode_args(recipe).unwrap();

    // Create recipe
    let response: RpcResult<Recipe> = catts_update(
        &ic,
        catts,
        identity.sender().unwrap(),
        "recipe_create",
        args.clone(),
    );
    assert!(response.is_ok());

    // Publish it
    let created_recipe = response.unwrap_ok();
    let response: RpcResult<Recipe> = catts_update(
        &ic,
        catts,
        identity.sender().unwrap(),
        "recipe_publish",
        encode_one(created_recipe.id).unwrap(),
    );
    assert!(response.is_ok());

    // Attempt to save it again
    let response: RpcResult<Recipe> = catts_update(
        &ic,
        catts,
        identity.sender().unwrap(),
        "recipe_create",
        args,
    );
    assert!(response.is_err());
    let error = response.unwrap_err();
    assert_eq!(error.code, 409);
    let details = error.details.as_deref().expect("No error details found");
    assert_eq!(details, "Only drafts can be updated");
}
