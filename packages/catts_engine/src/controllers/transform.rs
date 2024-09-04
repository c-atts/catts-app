use ic_cdk::{
    api::management_canister::http_request::{HttpResponse, TransformArgs},
    query,
};

use crate::logger::{self};

#[query]
fn transform(raw: TransformArgs) -> HttpResponse {
    logger::debug(&format!("transform: {:?}", raw));
    let mut res = HttpResponse {
        status: raw.response.status.clone(),
        body: raw.response.body.clone(),
        ..Default::default()
    };

    if i32::try_from(res.status.clone().0).unwrap() == 200 {
        res.body = raw.response.body;
    } else {
        ic_cdk::api::print(format!("Received an error from proxy: err = {:?}", raw));
    }

    res
}
