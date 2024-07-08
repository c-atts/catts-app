use candid::{encode_args, Principal};
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

#[test]
fn recipe_create_name_too_short() {
    let (ic, siwe, catts) = setup();
    let (_, identity) = full_login(&ic, siwe, None);
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
    let (_, identity) = full_login(&ic, siwe, None);
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
    let (_, identity) = full_login(&ic, siwe, None);
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
    let (_, identity) = full_login(&ic, siwe, None);
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
fn recipe_create_display_name_too_short() {
    let (ic, siwe, catts) = setup();
    let (_, identity) = full_login(&ic, siwe, None);
    let mut args = recipe_eu_gtc_passport_clone();
    args.0.display_name = Some("a".to_string());
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
        "display_name: Validation error: length".to_string()
    );
}

#[test]
fn recipe_create_display_name_too_long() {
    let (ic, siwe, catts) = setup();
    let (_, identity) = full_login(&ic, siwe, None);
    let mut args = recipe_eu_gtc_passport_clone();
    args.0.display_name = Some("a".repeat(51).to_string());
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
        "display_name: Validation error: length".to_string()
    );
}

#[test]
fn recipe_create_description_too_short() {
    let (ic, siwe, catts) = setup();
    let (_, identity) = full_login(&ic, siwe, None);
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
    let (_, identity) = full_login(&ic, siwe, None);
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
    let (_, identity) = full_login(&ic, siwe, None);
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
    let (_, identity) = full_login(&ic, siwe, None);
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
    let (_, identity) = full_login(&ic, siwe, None);
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
    let (_, identity) = full_login(&ic, siwe, None);
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
    let (_, identity) = full_login(&ic, siwe, None);
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
    let (_, identity) = full_login(&ic, siwe, None);
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
