use actix_files::{Files, NamedFile};
use actix_web::{web, Responder};

pub fn init(cfg: &mut web::ServiceConfig) {
  cfg.service(Files::new("/", "./client/build").index_file("index.html"));
}

pub async fn fallback_fn() -> impl Responder {
  NamedFile::open("./client/build/index.html")
}
