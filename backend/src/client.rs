use actix_files::{Files, NamedFile};
use actix_web::{web, Responder};

pub fn init(cfg: &mut web::ServiceConfig) {
  cfg.service(Files::new("/", "./frontend/build").index_file("index.html"));
}

pub async fn fallback_fn() -> impl Responder {
  NamedFile::open("./frontend/build/index.html")
}
