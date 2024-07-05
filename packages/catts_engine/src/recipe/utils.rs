use crate::eth::EthAddress;
use crate::recipe::{RecipeId, RecipeName};
use blake2::digest::{Update, VariableOutput};
use blake2::Blake2bVar;

pub fn generate_recipe_id(creator: &EthAddress, name: &RecipeName) -> RecipeId {
    let mut hasher = Blake2bVar::new(12).unwrap();
    hasher.update(&creator.as_byte_array());
    hasher.update(name.value().as_bytes());
    let mut buf = [0u8; 12];
    hasher.finalize_variable(&mut buf).unwrap();
    buf
}
