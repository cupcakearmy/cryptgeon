use actix_web::{delete, get, post, web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;

use crate::note::{generate_id, Note, PubNote};

lazy_static! {
  static ref RAM: Mutex<HashMap<String, Note>> = {
    let mut m = HashMap::new();
    m.insert(
      "test".to_string(),
      Note {
        contents: "some stuff".to_string(),
        password: false,
        views: Some(1),
        expiration: Some(100),
      },
    );
    return Mutex::new(m);
  };
}

#[derive(Serialize, Deserialize)]
struct NotePath {
  id: String,
}

#[get("/notes/{id}")]
async fn one(path: web::Path<NotePath>) -> impl Responder {
  let ram = RAM.lock().unwrap();
  let p = path.into_inner();
  let note = ram.get(&p.id);
  match note {
    None => return HttpResponse::NotFound().finish(),
    Some(note) => {
      return HttpResponse::Ok().json(PubNote {
        password: note.password,
      })
    }
  }
}

#[get("/notes/")]
async fn all() -> impl Responder {
  let values: Vec<Note> = RAM.lock().unwrap().values().cloned().collect();
  return HttpResponse::Ok().json(values);
}

#[derive(Serialize, Deserialize)]
struct CreateResponse {
  id: String,
}

#[post("/notes/")]
async fn create(note: web::Json<Note>) -> impl Responder {
  let n = note.into_inner();
  let id = generate_id();
  RAM.lock().unwrap().insert(id.clone(), n.clone());
  return HttpResponse::Ok().json(CreateResponse { id: id });
}

#[delete("/notes/{id}")]
async fn delete(path: web::Path<NotePath>) -> impl Responder {
  let mut ram = RAM.lock().unwrap();
  let p = path.into_inner();
  let note = ram.get(&p.id);
  match note {
    None => return HttpResponse::NotFound().finish(),
    Some(note) => {
      let mut changed = note.clone();
      if changed.views == None && changed.expiration == None {
        return HttpResponse::BadRequest().finish();
      } else {
        match changed.views {
          Some(v) => {
            changed.views = Some(v - 1);
            if v <= 1 {
              ram.remove(&p.id);
            } else {
              ram.insert(p.id, changed.clone());
            }
          }
          _ => {}
        }
        return HttpResponse::Ok().json(changed);
      }
    }
  }
}

pub fn init(cfg: &mut web::ServiceConfig) {
  cfg.service(create);
  cfg.service(delete);
  cfg.service(one);
  cfg.service(all);
}
