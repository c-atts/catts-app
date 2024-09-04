use crate::{eth_address::EthAddress, recipe, user};
use crate::{http_request::http::default_headers, ASSETS, SIGNATURES};
use crate::{run, CHAIN_CONFIGS};
use asset_util::{collect_assets, Asset, CertifiedAssets, ContentEncoding, ContentType};
use ethers_core::utils::hex;
use handlebars::Handlebars;
use ic_canister_sig_creation::signature_map::LABEL_SIG;
use ic_cdk::api::set_certified_data;
use ic_certification::{fork_hash, labeled_hash};
use include_dir::{include_dir, Dir};
use resvg::{
    tiny_skia::{self, Pixmap},
    usvg::{fontdb, Options, Tree},
};
use serde_json::{json, Value};
use std::sync::Arc;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AssetError {
    #[error("Invalid argument")]
    InvalidArgument,
    #[error("Not found")]
    NotFound,
}

pub static ASSET_DIR: Dir<'_> = include_dir!("$CARGO_MANIFEST_DIR/../catts_frontend/dist");

pub fn update_root_hash() {
    SIGNATURES.with_borrow(|sigs| {
        ASSETS.with_borrow(|assets| {
            let prefixed_root_hash = fork_hash(
                &assets.root_hash(),
                &labeled_hash(LABEL_SIG, &sigs.root_hash()),
            );
            set_certified_data(&prefixed_root_hash[..]);
        })
    })
}

fn render_index_html(url_path: String, mut data: Value) -> Asset {
    let handlebars = Handlebars::new();
    data.as_object_mut()
        .unwrap()
        .insert("domain".to_string(), json!("catts.run"));
    let index_file = ASSET_DIR.get_file("index.html").unwrap();
    let index_content_rendered = handlebars
        .render_template(index_file.contents_utf8().unwrap(), &data)
        .unwrap();

    Asset {
        url_path,
        content: index_content_rendered.clone().into_bytes(),
        encoding: ContentEncoding::Identity,
        content_type: ContentType::HTML,
    }
}

fn render_asset(template: &str, data: Value, address: &str) -> Asset {
    let handlebars = Handlebars::new();
    let ogimage_content_rendered = handlebars.render_template(template, &data).unwrap();

    let mut fontdb = fontdb::Database::new();
    fontdb.load_font_data(include_bytes!("includes/IBMPlexMono-Light.ttf").to_vec());
    fontdb.load_font_data(include_bytes!("includes/Helvetica.ttf").to_vec());
    fontdb.load_font_data(include_bytes!("includes/Helvetica-Light.ttf").to_vec());

    let options = Options {
        font_family: "Helvetica".to_string(),
        fontdb: Arc::new(fontdb),
        ..Default::default()
    };

    let tree = Tree::from_str(&ogimage_content_rendered, &options).unwrap();
    let mut pixmap = Pixmap::new(1200, 630).unwrap();
    resvg::render(&tree, tiny_skia::Transform::default(), &mut pixmap.as_mut());

    Asset {
        url_path: format!("/{}/ogimage.png", address),
        content: pixmap.encode_png().unwrap(),
        encoding: ContentEncoding::Identity,
        content_type: ContentType::PNG,
    }
}

fn certify_and_update_assets(assets: Vec<Asset>) {
    ASSETS.with_borrow_mut(|certified_assets| {
        for asset in &assets {
            certified_assets.certify_asset(asset.clone(), &default_headers());
        }
    });
    update_root_hash();
}

pub fn render_user_assets(address: String) -> Result<Vec<Asset>, AssetError> {
    let index_asset = render_index_html(
        format!("/user/{}", address),
        json!({
            "ogimage": format!("/user/{}/ogimage.png", address),
            "title": "C-ATTS, Composite Attestations",
            "description": "Move, transform and combine attestations! C-ATTS introduces the concept of composite attestations, a new type of attestation combining data from multiple sources to form a unified and verifiable credential.",
        }),
    );

    let eth_address = EthAddress::new(&address).map_err(|_| AssetError::InvalidArgument)?;
    let user = user::get_by_eth_address(&eth_address).map_err(|_| AssetError::NotFound)?;

    let ogimage_asset = render_asset(
        include_str!("includes/ogimage_template_user.svg"),
        json!({"eth_address": user.eth_address}),
        &format!("user/{}", address),
    );

    certify_and_update_assets(vec![index_asset.clone(), ogimage_asset.clone()]);

    Ok(vec![index_asset, ogimage_asset])
}

pub fn render_recipe_assets(recipe_name: String) -> Result<Vec<Asset>, AssetError> {
    let recipe = recipe::get_by_name(&recipe_name).map_err(|_| AssetError::NotFound)?;

    let index_asset = render_index_html(
        format!("/recipe/{}", recipe_name),
        json!({
            "ogimage": format!("/recipe/{}/ogimage.png", recipe_name),
            "title": format!("C-ATTS: {}", recipe.name),
            "description": recipe.description,
        }),
    );

    let ogimage_asset = render_asset(
        include_str!("includes/ogimage_template_recipe.svg"),
        json!({
            "creator": recipe.creator,
            "name": recipe.name,
            "description": recipe.description,
        }),
        &format!("recipe/{}", recipe_name),
    );

    certify_and_update_assets(vec![index_asset.clone(), ogimage_asset.clone()]);

    Ok(vec![index_asset, ogimage_asset])
}

pub fn render_run_assets(run_id_hex: String) -> Result<Vec<Asset>, AssetError> {
    let run_id = hex::decode(&run_id_hex).map_err(|_| AssetError::InvalidArgument)?;
    let run_id = run::vec_to_run_id(run_id).map_err(|_| AssetError::InvalidArgument)?;
    let run = run::get(&run_id).map_err(|_| AssetError::NotFound)?;
    let recipe = recipe::get_by_id(&run.recipe_id).map_err(|_| AssetError::NotFound)?;

    let index_asset = render_index_html(
        format!("/run/{}", run_id_hex),
        json!({
            "ogimage": format!("/run/{}/ogimage.png", run_id_hex),
            "title": format!("C-ATTS: {}, run: {}", recipe.name, run_id_hex),
            "description": recipe.description,
        }),
    );

    let chain_name = CHAIN_CONFIGS
        .with_borrow(|configs| configs.get(&run.chain_id).map(|config| config.name.clone()))
        .unwrap();

    let ogimage_asset = render_asset(
        include_str!("includes/ogimage_template_run.svg"),
        json!({
            "creator": recipe.creator,
            "recipe_name": recipe.name,
            "run_id": run_id_hex,
            "chain_name": chain_name,
        }),
        &format!("run/{}", run_id_hex),
    );

    certify_and_update_assets(vec![index_asset.clone(), ogimage_asset.clone()]);

    Ok(vec![index_asset, ogimage_asset])
}

pub fn render_default_assets(url_path: &str) -> Result<Vec<Asset>, AssetError> {
    let index_asset = render_index_html(
        url_path.to_string(),
        json!({
            "ogimage": "/ogimage.png",
            "title": "C-ATTS, Composite Attestations",
            "description": "Move, transform and combine attestations! C-ATTS introduces the concept of composite attestations, a new type of attestation combining data from multiple sources to form a unified and verifiable credential.",
        }),
    );

    certify_and_update_assets(vec![index_asset.clone()]);

    Ok(vec![index_asset])
}

pub fn init_assets() {
    let assets = collect_assets(&ASSET_DIR, None);
    ASSETS.with_borrow_mut(|certified_assets| {
        *certified_assets = CertifiedAssets::certify_assets(assets, &default_headers());
    });
    update_root_hash();
    let default_asset_paths = vec!["/", "/explorer", "/popular", "/recipes", "/runs", "/search"];
    for path in default_asset_paths {
        render_default_assets(path).unwrap();
    }
}
