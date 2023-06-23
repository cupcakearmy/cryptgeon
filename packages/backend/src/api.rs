use actix_web::web;

use crate::health;
use crate::note;
use crate::status;

pub fn init(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api")
            .service(note::init())
            .service(status::init())
            .service(health::init()),
    );
}
