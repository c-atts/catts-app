use crate::{eth::EthAddress, recipe::RecipeId};
use blake2::{
    digest::{Update, VariableOutput},
    Blake2bVar,
};

pub fn generate_recipe_id(creator: &EthAddress, name: &str) -> RecipeId {
    let mut hasher = Blake2bVar::new(12).unwrap();
    hasher.update(&creator.as_byte_array());
    hasher.update(name.as_bytes());
    let mut buf = [0u8; 12];
    hasher.finalize_variable(&mut buf).unwrap();
    buf
}
