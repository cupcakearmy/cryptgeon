use actix_web::{delete, get, post, web, HttpResponse, Responder, Scope};
use serde::{Deserialize, Serialize};
use std::time::SystemTime;

use crate::config;
use crate::note::{generate_id, Note, NoteInfo, NotePublic};
use crate::store;

pub fn now() -> u32 {
    SystemTime::now()
        .duration_since(SystemTime::UNIX_EPOCH)
        .unwrap()
        .as_secs() as u32
}

#[derive(Serialize, Deserialize)]
struct NotePath {
    id: String,
}

#[get("/{id}")]
async fn one(path: web::Path<NotePath>) -> impl Responder {
    let p = path.into_inner();
    let note = store::get(&p.id);

    match note {
        Ok(Some(n)) => HttpResponse::Ok().json(NoteInfo { meta: n.meta }),
        Ok(None) => HttpResponse::NotFound().finish(),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

#[derive(Serialize, Deserialize)]
struct CreateResponse {
    id: String,
}

#[post("/")]
async fn create(note: web::Json<Note>) -> impl Responder {
    let mut n = note.into_inner();
    let id = generate_id();
    let bad_req = HttpResponse::BadRequest().finish();
    if n.views == None && n.expiration == None {
        return bad_req;
    }
    if !*config::ALLOW_ADVANCED {
        n.views = Some(1);
        n.expiration = None;
    }
    match n.views {
        Some(v) => {
            if v > *config::MAX_VIEWS || v < 1 {
                return bad_req;
            }
            n.expiration = None; // views overrides expiration
        }
        _ => {}
    }
    match n.expiration {
        Some(e) => {
            if e > *config::MAX_EXPIRATION {
                return bad_req;
            }
            let expiration = now() + (e * 60);
            n.expiration = Some(expiration);
        }
        _ => {}
    }
    match store::set(&id.clone(), &n.clone()) {
        Ok(_) => return HttpResponse::Ok().json(CreateResponse { id: id }),
        Err(e) => return HttpResponse::InternalServerError().body(e.to_string()),
    }
}

#[delete("/{id}")]
async fn delete(path: web::Path<NotePath>) -> impl Responder {
    let p = path.into_inner();
    let note = store::get(&p.id);
    match note {
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
        Ok(None) => return HttpResponse::NotFound().finish(),
        Ok(Some(note)) => {
            let mut changed = note.clone();
            if changed.views == None && changed.expiration == None {
                return HttpResponse::BadRequest().finish();
            }
            match changed.views {
                Some(v) => {
                    changed.views = Some(v - 1);
                    let id = p.id.clone();
                    if v <= 1 {
                        match store::del(&id) {
                            Err(e) => {
                                return HttpResponse::InternalServerError().body(e.to_string())
                            }
                            _ => {}
                        }
                    } else {
                        match store::set(&id, &changed.clone()) {
                            Err(e) => {
                                return HttpResponse::InternalServerError().body(e.to_string())
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
                        match store::del(&p.id.clone()) {
                            Ok(_) => return HttpResponse::BadRequest().finish(),
                            Err(e) => {
                                return HttpResponse::InternalServerError().body(e.to_string())
                            }
                        }
                    }
                }
                _ => {}
            }
            return HttpResponse::Ok().json(NotePublic {
                contents: changed.contents,
                meta: changed.meta,
            });
        }
    }
}

#[derive(Serialize, Deserialize)]
struct Status {
    version: String,
    max_size: usize,
}

pub fn init() -> Scope {
    web::scope("/notes")
        .service(one)
        .service(create)
        .service(delete)
}
