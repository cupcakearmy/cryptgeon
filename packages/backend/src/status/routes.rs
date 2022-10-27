use actix_web::{get, web, HttpResponse, Responder, Scope};

use crate::config;
use crate::status::Status;

#[get("/")]
async fn get_status() -> impl Responder {
    return HttpResponse::Ok().json(Status {
        version: config::VERSION.to_string(),
        max_size: *config::LIMIT as u32,
        max_views: *config::MAX_VIEWS,
        max_expiration: *config::MAX_EXPIRATION,
        allow_advanced: *config::ALLOW_ADVANCED,
        theme_image: config::THEME_IMAGE.to_string(),
        theme_text: config::THEME_TEXT.to_string(),
        theme_page_title: config::THEME_PAGE_TITLE.to_string(),
        theme_favicon: config::THEME_FAVICON.to_string()
    });
}

pub fn init() -> Scope {
    web::scope("/status").service(get_status)
}
