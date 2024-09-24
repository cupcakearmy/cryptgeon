use crate::config;
use axum::{http::StatusCode, Json};
use serde::Serialize;

#[derive(Serialize)]
pub struct Status {
    // General
    pub version: String,
    // Config
    pub max_size: u32,
    pub max_views: u32,
    pub max_expiration: u32,
    pub allow_advanced: bool,
    pub allow_files: bool,
    pub imprint_url: String,
    pub imprint_html: String,
    // Theme
    pub theme_image: String,
    pub theme_text: String,
    pub theme_page_title: String,
    pub theme_favicon: String,
    pub theme_new_note_notice: bool,
}

pub async fn get_status() -> (StatusCode, Json<Status>) {
    let status = Status {
        version: config::VERSION.to_string(),
        max_size: *config::LIMIT as u32,
        max_views: *config::MAX_VIEWS,
        max_expiration: *config::MAX_EXPIRATION,
        allow_advanced: *config::ALLOW_ADVANCED,
        allow_files: *config::ALLOW_FILES,
        imprint_url: config::IMPRINT_URL.to_string(),
        imprint_html: config::IMPRINT_HTML.to_string(),
        theme_new_note_notice: *config::THEME_NEW_NOTE_NOTICE,
        theme_image: config::THEME_IMAGE.to_string(),
        theme_text: config::THEME_TEXT.to_string(),
        theme_page_title: config::THEME_PAGE_TITLE.to_string(),
        theme_favicon: config::THEME_FAVICON.to_string(),
    };

    (StatusCode::OK, Json(status))
}
