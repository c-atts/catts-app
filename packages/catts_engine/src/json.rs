use candid::Nat;
use serde_json::Value;

pub trait ToJsonValue {
    fn to_json_value(&self) -> Value;
}

pub fn bytes_to_hex_string(bytes: &[u8]) -> String {
    let mut hex_string = String::from("0x");
    for byte in bytes {
        hex_string.push_str(&format!("{:02x}", byte));
    }
    hex_string
}

pub fn bytes_to_hex_string_value(bytes: &[u8]) -> Value {
    Value::String(bytes_to_hex_string(bytes))
}

pub fn nat_to_hex_string_value(nat: &Nat) -> Value {
    let bytes = nat.0.to_bytes_be();
    bytes_to_hex_string_value(&bytes)
}
