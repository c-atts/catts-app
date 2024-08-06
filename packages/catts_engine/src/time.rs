pub fn time() -> u32 {
    (ic_cdk::api::time() / 1_000_000_000) as u32
}
