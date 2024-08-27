use axum::{
    extract::Path,
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde::{Deserialize, Serialize};
use std::time::SystemTime;

use crate::config;
use crate::note::{generate_id, Note, NoteInfo};
use crate::store;

use super::NotePublic;

pub fn now() -> u32 {
    SystemTime::now()
        .duration_since(SystemTime::UNIX_EPOCH)
        .unwrap()
        .as_secs() as u32
}

#[derive(Deserialize)]
pub struct OneNoteParams {
    id: String,
}

pub async fn preview(Path(OneNoteParams { id }): Path<OneNoteParams>) -> Response {
    let note = store::get(&id);

    match note {
        Ok(Some(n)) => (StatusCode::OK, Json(NoteInfo { meta: n.meta })).into_response(),
        Ok(None) => (StatusCode::NOT_FOUND).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response(),
    }
}

#[derive(Serialize, Deserialize)]
struct CreateResponse {
    id: String,
}

pub async fn create(Json(mut n): Json<Note>) -> Response {
    // let mut n = note.into_inner();
    let id = generate_id();
    // let bad_req = HttpResponse::BadRequest().finish();
    if n.views == None && n.expiration == None {
        return (
            StatusCode::BAD_REQUEST,
            "At least views or expiration must be set",
        )
            .into_response();
    }
    if !*config::ALLOW_ADVANCED {
        n.views = Some(1);
        n.expiration = None;
    }
    match n.views {
        Some(v) => {
            if v > *config::MAX_VIEWS || v < 1 {
                return (StatusCode::BAD_REQUEST, "Invalid views").into_response();
            }
            n.expiration = None; // views overrides expiration
        }
        _ => {}
    }
    match n.expiration {
        Some(e) => {
            if e > *config::MAX_EXPIRATION || e < 1 {
                return (StatusCode::BAD_REQUEST, "Invalid expiration").into_response();
            }
            let expiration = now() + (e * 60);
            n.expiration = Some(expiration);
        }
        _ => {}
    }
    match store::set(&id.clone(), &n.clone()) {
        Ok(_) => (StatusCode::OK, Json(CreateResponse { id })).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response(),
    }
}

pub async fn delete(Path(OneNoteParams { id }): Path<OneNoteParams>) -> Response {
    let note = store::get(&id);
    match note {
        // Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
        // Ok(None) => return HttpResponse::NotFound().finish(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response(),
        Ok(None) => (StatusCode::NOT_FOUND).into_response(),
        Ok(Some(note)) => {
            let mut changed = note.clone();
            if changed.views == None && changed.expiration == None {
                return (StatusCode::BAD_REQUEST).into_response();
            }
            match changed.views {
                Some(v) => {
                    changed.views = Some(v - 1);
                    let id = id.clone();
                    if v <= 1 {
                        match store::del(&id) {
                            Err(e) => {
                                return (StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
                                    .into_response();
                            }
                            _ => {}
                        }
                    } else {
                        match store::set(&id, &changed.clone()) {
                            Err(e) => {
                                return (StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
                                    .into_response();
                            }
                            _ => {}
                        }
                    }
                }
                _ => {}
            }

            let n = now();
            match changed.expiration {
                Some(e) => {
                    if e < n {
                        match store::del(&id.clone()) {
                            Ok(_) => return (StatusCode::BAD_REQUEST).into_response(),
                            Err(e) => {
                                return (StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
                                    .into_response()
                            }
                        }
                    }
                }
                _ => {}
            }

            return (
                StatusCode::OK,
                Json(NotePublic {
                    contents: changed.contents,
                    meta: changed.meta,
                }),
            )
                .into_response();
        }
    }
}
