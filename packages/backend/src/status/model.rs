use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct Status {
    // General
    pub version: String,
    // Config
    pub max_size: u32,
    pub max_views: u32,
    pub max_expiration: u32,
    pub allow_advanced: bool,
    pub allow_files: bool,
    pub theme_new_note_notice: bool,
    // Theme
    pub theme_image: String,
    pub theme_text: String,
    pub theme_page_title: String,
    pub theme_favicon: String,
}
