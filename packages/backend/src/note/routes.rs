use axum::{
    extract::Path,
    http::StatusCode,
    response::{IntoResponse, Response},
    body::Bytes,
};
use serde::Deserialize;
use std::time::SystemTime;

use crate::note::{CreateRequest, generate_id};
use crate::store;
use crate::config;

use super::{CreateResponse, MetaResponse, NoteResponse, NoteMeta};

pub fn now() -> u64 {
    SystemTime::now()
        .duration_since(SystemTime::UNIX_EPOCH)
        .unwrap()
        .as_secs()
}

#[derive(Deserialize)]
pub struct NoteParams {
    id: String,
}

/// Note IDs are bs62-encoded random bytes generated server-side, i.e. plain
/// ASCII alphanumerics. Anything else can never exist, and rejecting it here
/// keeps arbitrary cache keys (e.g. other apps on a shared instance without
/// CACHE_PREFIX) out of reach.
fn valid_id(id: &str) -> bool {
    let max = (*config::ID_LENGTH as usize) * 2;
    !id.is_empty() && id.len() <= max && id.bytes().all(|b| b.is_ascii_alphanumeric())
}

pub async fn create(body: Bytes) -> Response {
    let req: CreateRequest = match rmp_serde::from_slice(&body) {
        Ok(r) => r,
        Err(_) => return (StatusCode::BAD_REQUEST, "Invalid msgpack").into_response(),
    };

    if req.meta.views.is_none() && req.meta.expiration.is_none() {
        return (StatusCode::BAD_REQUEST, "At least views or expiration must be set").into_response();
    }

    if req.meta.extra.len() > *config::EXTRA_SIZE_LIMIT {
        return (StatusCode::BAD_REQUEST, "Extra data too large").into_response();
    }

    let mut meta = req.meta;

    if !*config::ALLOW_ADVANCED {
        meta.views = Some(1);
        meta.expiration = None;
    }

    match meta.views {
        Some(v) => {
            if v > *config::MAX_VIEWS || v < 1 {
                return (StatusCode::BAD_REQUEST, "Invalid views").into_response();
            }
        }
        None => {}
    }

    let expiration_ts = match meta.expiration {
        Some(e) => {
            if e > *config::MAX_EXPIRATION || e < 1 {
                return (StatusCode::BAD_REQUEST, "Invalid expiration").into_response();
            }
            Some(now() + (e as u64 * 60))
        }
        None => None,
    };

    let id = generate_id();
    let views = meta.views.map(|v| v as i64);

    match store::set(&id, &req.data, views, expiration_ts, &meta.extra) {
        Ok(_) => {
            let resp = CreateResponse { id };
            let bytes = rmp_serde::to_vec_named(&resp).unwrap();
            (StatusCode::OK, Bytes::from(bytes)).into_response()
        }
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response(),
    }
}

pub async fn preview(Path(NoteParams { id }): Path<NoteParams>) -> Response {
    if !valid_id(&id) {
        return (StatusCode::NOT_FOUND).into_response();
    }
    match store::get_meta(&id) {
        Ok(Some((views, expiration, extra))) => {
            let meta = NoteMeta {
                views: views.map(|v| v.max(0) as u32),
                expiration: expiration.map(|e| e as u32),
                extra,
            };
            let resp = MetaResponse { meta };
            let bytes = rmp_serde::to_vec_named(&resp).unwrap();
            (StatusCode::OK, Bytes::from(bytes)).into_response()
        }
        Ok(None) => (StatusCode::NOT_FOUND).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response(),
    }
}

pub async fn view(Path(NoteParams { id }): Path<NoteParams>) -> Response {
    if !valid_id(&id) {
        return (StatusCode::NOT_FOUND).into_response();
    }

    let (views, expiration, extra) = match store::get_meta(&id) {
        Ok(Some(v)) => v,
        _ => return (StatusCode::NOT_FOUND).into_response(),
    };

    if views.is_some() {
        // Atomic check-and-decrement: concurrent requests racing for the last
        // view cannot all be served.
        let (remaining, data, expiration, extra) = match store::consume(&id) {
            Ok(Some(v)) => v,
            _ => return (StatusCode::NOT_FOUND).into_response(),
        };

        let meta = NoteMeta {
            views: Some(remaining as u32),
            expiration: expiration.map(|e| e as u32),
            extra,
        };
        let resp = NoteResponse { meta, data };
        let bytes = rmp_serde::to_vec_named(&resp).unwrap();
        (StatusCode::OK, Bytes::from(bytes)).into_response()
    } else {
        let data = match store::get_data(&id) {
            Ok(Some(d)) => d,
            _ => return (StatusCode::NOT_FOUND).into_response(),
        };

        let meta = NoteMeta {
            views: None,
            expiration: expiration.map(|e| e as u32),
            extra,
        };
        let resp = NoteResponse { meta, data };
        let bytes = rmp_serde::to_vec_named(&resp).unwrap();
        (StatusCode::OK, Bytes::from(bytes)).into_response()
    }
}