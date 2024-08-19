use std::collections::HashMap;

use regex::Regex;

use crate::eth_address::EthAddress;

pub fn replace_dynamic_variables(variables_template: &str, address: &EthAddress) -> String {
    let mut dynamic_values: HashMap<String, String> = HashMap::new();
    dynamic_values.insert("user_eth_address".to_string(), address.to_string());
    dynamic_values.insert(
        "user_eth_address_lowercase".to_string(),
        address.to_string().to_lowercase(),
    );

    if variables_template.is_empty() {
        return variables_template.to_string();
    }

    let re = Regex::new(r"\{(\w+)\}").unwrap();

    re.replace_all(variables_template, |captures: &regex::Captures| {
        dynamic_values
            .get(&captures[1])
            .cloned()
            .unwrap_or_else(|| captures[0].to_string())
    })
    .to_string()
}
