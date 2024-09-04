use crate::{
    http_request::http::{default_headers, HttpRequest, HttpResponse},
    ASSETS, SIGNATURES,
};
use ic_canister_sig_creation::signature_map::LABEL_SIG;
use ic_certification::{labeled_hash, pruned};

#[ic_cdk::query]
pub fn http_request(req: HttpRequest) -> HttpResponse {
    let req_url = req.url.split('?').next().unwrap().to_string();
    let sigs_root_hash =
        SIGNATURES.with_borrow(|sigs| pruned(labeled_hash(LABEL_SIG, &sigs.root_hash())));

    if let Some(asset) = ASSETS.with_borrow(|assets| {
        assets.get_certified_asset(
            &req_url,
            req.certificate_version,
            Some(sigs_root_hash.clone()),
        )
    }) {
        let mut headers = default_headers();
        headers.extend(asset.headers);
        return HttpResponse {
            status_code: 200,
            body: asset.content,
            headers,
            upgrade: None,
        };
    }

    // If asset is not found, return 404 and upgrade the connection to an update call
    // if the request URL is one of the following:
    let upgrade_requests = ["/recipe", "/run", "/user"];
    if upgrade_requests.iter().any(|&url| req_url.starts_with(url)) {
        return HttpResponse {
            status_code: 404,
            headers: default_headers(),
            body: vec![],
            upgrade: Some(true),
        };
    }

    HttpResponse {
        status_code: 404,
        headers: default_headers(),
        body: "Asset not found.".as_bytes().to_vec(),
        upgrade: None,
    }
}
