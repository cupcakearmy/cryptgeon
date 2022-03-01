use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct Status {
  pub version: String,
  pub max_size: usize,
  pub max_views: usize,
  pub max_expiration: usize,
  pub allow_advanced: bool,
}
