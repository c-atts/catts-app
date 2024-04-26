use ic_cdk::update;

use crate::{error::Error, siwe::get_caller_eth_address, user_profile::UserProfile, USER_PROFILES};

/// Returns the profile of the caller if it exists.
#[update]
async fn get_my_profile() -> Result<UserProfile, Error> {
    let address = get_caller_eth_address().await?;

    match USER_PROFILES.with(|p| p.borrow().get(&ic_cdk::caller().to_string())) {
        Some(profile) => Ok(profile.clone()),
        None => Ok(UserProfile::new(
            address.as_str().to_string(),
            "".to_string(),
            "".to_string(),
        )),
    }
}
