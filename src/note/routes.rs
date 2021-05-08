use actix_web::{delete, get, post, web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use std::time::SystemTime;

use crate::note::{generate_id, Note, NoteInfo, NotePublic};
use crate::store;

fn now() -> u64 {
  SystemTime::now()
    .duration_since(SystemTime::UNIX_EPOCH)
    .unwrap()
    .as_secs()
}

#[derive(Serialize, Deserialize)]
struct NotePath {
  id: String,
}

#[get("/notes/{id}")]
async fn one(path: web::Path<NotePath>) -> impl Responder {
  let p = path.into_inner();
  let note = store::get(&p.id);
  match note {
    None => return HttpResponse::NotFound().finish(),
    Some(_) => return HttpResponse::Ok().json(NoteInfo {}),
  }
}

#[derive(Serialize, Deserialize)]
struct CreateResponse {
  id: String,
}

#[post("/notes")]
async fn create(note: web::Json<Note>) -> impl Responder {
  let mut n = note.into_inner();
  let id = generate_id();
  let bad_req = HttpResponse::BadRequest().finish();
  if n.contents.chars().count() > 8192 {
    return bad_req;
  }
  if n.views == None && n.expiration == None {
    return bad_req;
  }
  match n.views {
    Some(v) => {
      if v > 100 {
        return bad_req;
      }
    }
    _ => {}
  }
  match n.expiration {
    Some(e) => {
      if e > 360 {
        return bad_req;
      }
      let expiration = now() + (e * 60);
      n.expiration = Some(expiration);
    }
    _ => {}
  }
  store::set(&id.clone(), &n.clone());
  return HttpResponse::Ok().json(CreateResponse { id: id });
}

#[delete("/notes/{id}")]
async fn delete(path: web::Path<NotePath>) -> impl Responder {
  let p = path.into_inner();
  let note = store::get(&p.id);
  match note {
    None => return HttpResponse::NotFound().finish(),
    Some(note) => {
      let mut changed = note.clone();
      if changed.views == None && changed.expiration == None {
        return HttpResponse::BadRequest().finish();
      }
      match changed.views {
        Some(v) => {
          changed.views = Some(v - 1);
          let id = p.id.clone();
          if v <= 1 {
            store::del(&id);
          } else {
            store::set(&id, &changed.clone());
          }
        }
        _ => {}
      }
      match changed.expiration {
        Some(e) => {
          store::del(&p.id.clone());
          if e < now() {
            return HttpResponse::BadRequest().finish();
          }
        }
        _ => {}
      }
      return HttpResponse::Ok().json(NotePublic {
        contents: changed.contents,
      });
    }
  }
}

pub fn init(cfg: &mut web::ServiceConfig) {
  cfg.service(
    web::scope("/api")
      .service(create)
      .service(delete)
      .service(one),
  );
}
