use actix_web::{get, web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};

use crate::note;
use crate::size::LIMIT;

#[derive(Serialize, Deserialize)]
struct Status {
  version: String,
  max_size: usize,
}

#[get("/status")]
async fn status() -> impl Responder {
  return HttpResponse::Ok().json(Status {
    version: option_env!("CARGO_PKG_VERSION")
      .unwrap_or("Unknown")
      .to_string(),
    max_size: *LIMIT,
  });
}

pub fn init(cfg: &mut web::ServiceConfig) {
  cfg.service(web::scope("/api").service(note::service()).service(status));
}
