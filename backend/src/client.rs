use actix_files::{Files, NamedFile};
use actix_web::{web, Result};

use crate::config;

pub fn init(cfg: &mut web::ServiceConfig) {
    cfg.service(
        Files::new("/", config::FRONTEND_PATH.to_string())
            .index_file("index.html")
            .use_etag(true),
    );
}

pub async fn index() -> Result<NamedFile> {
    let index = format!("{}{}", config::FRONTEND_PATH.to_string(), "/index.html");
    Ok(NamedFile::open(index)?)
}
