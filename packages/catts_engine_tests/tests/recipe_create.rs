use candid::{decode_one, encode_args, Principal};
use catts_engine_tests::{
    common::{setup, should_be_401, update_call},
    siwe::full_login,
    types::{Recipe, RecipeDetailsInput, RecipeQuery, RpcResult},
};
use ic_agent::Identity;

fn recipe_eu_gtc_passport_clone() -> (RecipeDetailsInput, String) {
    let details = RecipeDetailsInput {
        name: "eu-gtc-passport-clone".to_string(),
        display_name: None,
        description: None,
        keywords: None,
        queries: vec![RecipeQuery {
            endpoint: "https://optimism.easscan.org/graphql".to_string(),
            query: r#"
              query PassportQuery($where: AttestationWhereInput, $take: Int)
              {
                attestations(where: $where, take: $take)
                {
                  decodedDataJson
                }
              }
            "#
            .to_string(),
            variables: r#"
              {
                where: {
                  schemaId: {
                    equals:
                      "0x6ab5d34260fca0cfcf0e76e96d439cace6aa7c3c019d7c4580ed52c6845e9c89",
                  },
                  recipient: {
                    equals: "{user_eth_address}",
                    mode: "insensitive",
                  },
                },
                take: 1,
              }
            "#
            .to_string(),
        }],
        processor: r#"
            if (!queryResult[0].attestations[0]) {
            throw new Error("Couldn't find a Gitcoin Passport score for this address.");
            }

            const decodedDataJson = JSON.parse(
            queryResult[0].attestations[0].decodedDataJson
            );

            let data = [];
            for (const item of decodedDataJson) {
            data.push({
                name: item.name,
                type: item.type,
                value: item.name === "score" ? item.value.value.hex : item.value.value,
            });
            }

            return JSON.stringify(data);
        "#
        .to_string(),
        resolver: "0x0000000000000000000000000000000000000000".to_string(),
        schema: "uint256 score,uint32 scorer_id,uint8 score_decimals".to_string(),
        revokable: false,
    };

    let readme = r#"This recipe fetches the Gitcoin Passport score for a given Ethereum address."#
        .to_string();

    (details, readme)
}

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
