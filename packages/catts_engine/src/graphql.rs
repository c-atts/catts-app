use std::collections::HashMap;

use regex::Regex;

pub fn insert_dynamic_variables(
    variables_template: &str,
    dynamic_values: &HashMap<String, String>,
) -> String {
    if variables_template.is_empty() {
        return variables_template.to_string();
    }

    let re = Regex::new(r"\{(\w+)\}").unwrap();

    re.replace_all(variables_template, |caps: &regex::Captures| {
        dynamic_values
            .get(&caps[1])
            .cloned()
            .unwrap_or_else(|| caps[0].to_string())
    })
    .to_string()
}
