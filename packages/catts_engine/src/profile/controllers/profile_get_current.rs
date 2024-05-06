use ic_cdk::update;

use crate::{
    error::Error, profile::UserProfile, siwe::get_authenticated_eth_address, USER_PROFILES,
};

/// Returns the profile of the caller if it exists.
#[update]
async fn profile_get_current() -> Result<UserProfile, Error> {
    let address = get_authenticated_eth_address().await?;

    match USER_PROFILES.with(|p| p.borrow().get(&ic_cdk::caller().to_string())) {
        Some(profile) => Ok(profile.clone()),
        None => Ok(UserProfile::new(
            address.as_str().to_string(),
            "".to_string(),
            "".to_string(),
        )),
    }
}
