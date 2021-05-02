use actix_web::{delete, get, post, web, HttpResponse, Responder};
use memcache;
use serde::{Deserialize, Serialize};
use std::time::SystemTime;

use crate::note::{generate_id, Note, NoteInfo, NotePublic};

fn now() -> u64 {
  SystemTime::now()
    .duration_since(SystemTime::UNIX_EPOCH)
    .unwrap()
    .as_secs()
}

lazy_static! {
  static ref CLIENT: memcache::Client =
    memcache::connect("memcache://127.0.0.1:11211?timeout=10&tcp_nodelay=true").unwrap();
}

fn set(id: &String, note: &Note) {
  let serialized = serde_json::to_string(&note.clone()).unwrap();
  CLIENT.set(id, serialized, 0).unwrap();
}

fn get(id: &String) -> Option<Note> {
  let value: Option<String> = CLIENT.get(&id).unwrap();
  match value {
    None => return None,
    Some(s) => {
      let deserialize: Note = serde_json::from_str(&s).unwrap();
      return Some(deserialize);
    }
  }
}

fn del(id: &String) {
  CLIENT.delete(id).unwrap();
}

#[derive(Serialize, Deserialize)]
struct NotePath {
  id: String,
}

#[get("/notes/{id}")]
async fn one(path: web::Path<NotePath>) -> impl Responder {
  let p = path.into_inner();
  let note = get(&p.id);
  match note {
    None => return HttpResponse::NotFound().finish(),
    Some(note) => {
      return HttpResponse::Ok().json(NoteInfo {
        password: note.password,
      })
    }
  }
}

#[derive(Serialize, Deserialize)]
struct CreateResponse {
  id: String,
}

#[post("/notes/")]
async fn create(note: web::Json<Note>) -> impl Responder {
  let mut n = note.into_inner();
  let id = generate_id();
  let bad_req = HttpResponse::BadRequest().finish();
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
      n.expiration = Some(now() + (e * 60))
    }
    _ => {}
  }
  set(&id.clone(), &n.clone());
  return HttpResponse::Ok().json(CreateResponse { id: id });
}

#[delete("/notes/{id}")]
async fn delete(path: web::Path<NotePath>) -> impl Responder {
  let p = path.into_inner();
  let note = get(&p.id);
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
            del(&id);
          } else {
            set(&id, &changed.clone());
          }
        }
        _ => {}
      }
      match changed.expiration {
        Some(e) => {
          if e > now() {
            del(&p.id.clone());
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
  cfg.service(create);
  cfg.service(delete);
  cfg.service(one);
}
