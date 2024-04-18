use ic_cdk::update;

use crate::{authenticated, eas::Uid, eth::EthAddress, identity::get_address, run::Run};

#[update(guard = authenticated)]
async fn init_run(recipe_uid: Uid) -> Result<Run, String> {
    let address = get_address().await?;
    let address = EthAddress::new(&address)?;

    let active_runs = Run::get_active(&address.as_byte_array());
    if !active_runs.is_empty() {
        return Err(String::from("You already have an active run"));
    }

    // Fixed price for now, will be replaced with dynamic pricing
    let run = Run::new(&address, 10000000000000, &recipe_uid);

    Run::create(run.clone());
    Ok(run)
}
