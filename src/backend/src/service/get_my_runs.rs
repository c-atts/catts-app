use ic_cdk::{query, update};

use crate::{authenticated, eth::EthAddress, identity::get_address, run::Run};

#[update(guard = authenticated)]
async fn get_my_runs() -> Result<Vec<Run>, String> {
    let address = get_address().await?;
    let address = EthAddress::new(&address)?;

    Ok(Run::get_by_address(&address.as_byte_array()))
}
