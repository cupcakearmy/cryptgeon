use actix_files::{Files, NamedFile};
use actix_web::{web, Result};

pub fn init(cfg: &mut web::ServiceConfig) {
    cfg.service(
        Files::new("/", "./frontend/build")
            .index_file("index.html")
            .use_etag(true),
    );
}

pub async fn index() -> Result<NamedFile> {
    Ok(NamedFile::open("./frontend/build/index.html")?)
}
