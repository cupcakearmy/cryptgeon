use crate::config;
use actix_web::web;
use mime;

pub fn init(cfg: &mut web::ServiceConfig) {
    let json = web::JsonConfig::default().limit(*config::LIMIT);
    let plain = web::PayloadConfig::default()
        .limit(*config::LIMIT)
        .mimetype(mime::STAR_STAR);
    cfg.app_data(json).app_data(plain);
}
