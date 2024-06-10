use ic_cdk::query;

use crate::{profile::UserProfile, USER_PROFILES};

#[query]
fn profile_list() -> Result<Vec<(String, UserProfile)>, String> {
    let profiles = USER_PROFILES.with(|p| p.borrow().iter().collect::<Vec<_>>());
    Ok(profiles)
}
