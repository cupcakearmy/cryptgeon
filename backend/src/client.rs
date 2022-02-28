use actix_files::Files;
use actix_web::web;

pub fn init(cfg: &mut web::ServiceConfig) {
  cfg.service(
    Files::new("/", "./frontend/build")
      .index_file("index.html")
      .use_etag(true),
  );
}
