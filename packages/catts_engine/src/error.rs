use std::fmt::Display;

use candid::CandidType;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Debug, CandidType, Clone, Copy)]
pub enum HttpStatusCode {
    #[serde(rename = "400")]
    BadRequest = 400,
    Unauthorized = 401,
    Forbidden = 403,
    NotFound = 404,
    MethodNotAllowed = 405,
    InternalServerError = 500,
    NotImplemented = 501,
    BadGateway = 502,
    ServiceUnavailable = 503,
}

impl Serialize for HttpStatusCode {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_u16(*self as u16)
    }
}

#[derive(Serialize, Deserialize, Debug, CandidType, Clone)]
pub struct Error {
    code: HttpStatusCode,
    message: String,
    details: Option<String>,
}

impl Error {
    pub fn new(code: HttpStatusCode, message: String, details: Option<String>) -> Self {
        Self {
            code,
            message,
            details,
        }
    }

    pub fn bad_request<M: Display>(message: M) -> Self {
        Self::new(
            HttpStatusCode::BadRequest,
            "Bad request".to_string(),
            Some(message.to_string()),
        )
    }

    pub fn _unauthorized<M: Display>(message: M) -> Self {
        Self::new(
            HttpStatusCode::Unauthorized,
            "Unauthorized".to_string(),
            Some(message.to_string()),
        )
    }

    pub fn forbidden<M: Display>(message: M) -> Self {
        Self::new(
            HttpStatusCode::Forbidden,
            "Forbidden".to_string(),
            Some(message.to_string()),
        )
    }

    pub fn not_found<M: Display>(message: M) -> Self {
        Self::new(
            HttpStatusCode::NotFound,
            "Not found".to_string(),
            Some(message.to_string()),
        )
    }

    pub fn _method_not_allowed<M: Display>(message: M) -> Self {
        Self::new(
            HttpStatusCode::MethodNotAllowed,
            "Method not allowed".to_string(),
            Some(message.to_string()),
        )
    }

    pub fn internal_server_error<M: Display>(message: M) -> Self {
        Self::new(
            HttpStatusCode::InternalServerError,
            "Internal server error".to_string(),
            Some(message.to_string()),
        )
    }

    pub fn _not_implemented<M: Display>(message: M) -> Self {
        Self::new(
            HttpStatusCode::NotImplemented,
            "Not implemented".to_string(),
            Some(message.to_string()),
        )
    }

    pub fn _bad_gateway<M: Display>(message: M) -> Self {
        Self::new(
            HttpStatusCode::BadGateway,
            "Bad gateway".to_string(),
            Some(message.to_string()),
        )
    }

    pub fn _service_unavailable<M: Display>(message: M) -> Self {
        Self::new(
            HttpStatusCode::ServiceUnavailable,
            "Service unavailable".to_string(),
            Some(message.to_string()),
        )
    }
}
