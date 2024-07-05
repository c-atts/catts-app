use candid::{decode_one, Principal};
use catts_engine_tests::{
    common::{query_call, setup},
    types::{Recipe, RpcResult},
};

#[test]
fn test_recipe_list() {
    let (ic, _, catts) = setup();
    let response = query_call(&ic, catts, Principal::anonymous(), "recipe_list", vec![]);
    let result: RpcResult<Vec<Recipe>> = decode_one(&response).unwrap();
    assert!(matches!(result, RpcResult::Ok(_)));

    match result {
        RpcResult::Ok(recipes) => {
            assert_ne!(recipes.len(), 0);
        }
        _ => {
            unreachable!();
        }
    }
}
