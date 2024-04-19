use crate::authenticated;
use crate::eth::EthAddress;
use crate::run::{Run, RunId};
use crate::siwe::get_address;
use ic_cdk::update;

#[update (guard = authenticated)]
async fn cancel_run(run_id: RunId) -> Result<Run, String> {
    let address = get_address().await?;
    let address = EthAddress::new(&address)?;

    Run::cancel(&address.as_byte_array(), &run_id)
}
