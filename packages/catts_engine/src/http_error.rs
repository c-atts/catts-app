use std::fmt::Display;

use candid::CandidType;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Debug, CandidType, Clone, Copy)]
pub enum HttpStatusCode {
    BadRequest = 400,
    Unauthorized = 401,
    Forbidden = 403,
    NotFound = 404,
    MethodNotAllowed = 405,
    Conflict = 409,
    InternalServerError = 500,
    NotImplemented = 501,
    BadGateway = 502,
    ServiceUnavailable = 503,
}

#[derive(Serialize, Deserialize, Debug, CandidType, Clone)]
pub struct HttpError {
    code: u16,
    message: String,
    details: Option<String>,
}

impl HttpError {
    pub fn new(code: u16, message: String, details: Option<String>) -> Self {
        Self {
            code,
            message,
            details,
        }
    }

    pub fn bad_request<M: Display>(message: M) -> Self {
        Self::new(
            HttpStatusCode::BadRequest as u16,
            "Bad request".to_string(),
            Some(message.to_string()),
        )
    }

    pub fn unauthorized<M: Display>(message: M) -> Self {
        Self::new(
            HttpStatusCode::Unauthorized as u16,
            "Unauthorized".to_string(),
            Some(message.to_string()),
        )
    }

    pub fn forbidden<M: Display>(message: M) -> Self {
        Self::new(
            HttpStatusCode::Forbidden as u16,
            "Forbidden".to_string(),
            Some(message.to_string()),
        )
    }

    pub fn not_found<M: Display>(message: M) -> Self {
        Self::new(
            HttpStatusCode::NotFound as u16,
            "Not found".to_string(),
            Some(message.to_string()),
        )
    }

    pub fn _method_not_allowed<M: Display>(message: M) -> Self {
        Self::new(
            HttpStatusCode::MethodNotAllowed as u16,
            "Method not allowed".to_string(),
            Some(message.to_string()),
        )
    }

    pub fn conflict<M: Display>(message: M) -> Self {
        Self::new(
            HttpStatusCode::Conflict as u16,
            "Conflict".to_string(),
            Some(message.to_string()),
        )
    }

    pub fn internal_server_error<M: Display>(message: M) -> Self {
        Self::new(
            HttpStatusCode::InternalServerError as u16,
            "Internal server error".to_string(),
            Some(message.to_string()),
        )
    }

    pub fn _not_implemented<M: Display>(message: M) -> Self {
        Self::new(
            HttpStatusCode::NotImplemented as u16,
            "Not implemented".to_string(),
            Some(message.to_string()),
        )
    }

    pub fn _bad_gateway<M: Display>(message: M) -> Self {
        Self::new(
            HttpStatusCode::BadGateway as u16,
            "Bad gateway".to_string(),
            Some(message.to_string()),
        )
    }

    pub fn _service_unavailable<M: Display>(message: M) -> Self {
        Self::new(
            HttpStatusCode::ServiceUnavailable as u16,
            "Service unavailable".to_string(),
            Some(message.to_string()),
        )
    }
}
