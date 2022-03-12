use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct Status {
    pub version: String,
    pub max_size: u32,
    pub max_views: u32,
    pub max_expiration: u32,
    pub allow_advanced: bool,
}
