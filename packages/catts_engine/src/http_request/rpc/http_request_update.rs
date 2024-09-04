use crate::{
    certified_data::{render_recipe_assets, render_run_assets, render_user_assets},
    http_request::http::{default_headers, http_error, HttpRequest, HttpResponse},
};

#[ic_cdk::update]
async fn http_request_update(req: HttpRequest) -> HttpResponse {
    let path_segments: Vec<&str> = req.url.split('/').filter(|s| !s.is_empty()).collect();
    let render_result = match path_segments.as_slice() {
        ["user", user_id] => render_user_assets(user_id.to_string()),
        ["recipe", recipe_name] => render_recipe_assets(recipe_name.to_string()),
        ["run", run_id] => render_run_assets(run_id.to_string()),
        _ => {
            return http_error(404, "Not found.");
        }
    };

    let assets = match render_result {
        Ok(assets) => assets,
        Err(err) => {
            return http_error(500, &format!("{}", err));
        }
    };

    HttpResponse {
        status_code: 200,
        body: assets[0].clone().content,
        headers: default_headers(),
        upgrade: None,
    }
}
