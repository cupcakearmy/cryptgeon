use bs62;
use ring::rand::SecureRandom;
use serde::{Deserialize, Serialize};

use crate::config;

#[derive(Serialize, Deserialize, Clone)]
pub struct NoteMeta {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub views: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expiration: Option<u32>,
    #[serde(default)]
    pub extra: Vec<u8>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct CreateRequest {
    pub meta: NoteMeta,
    pub data: Vec<u8>,
}

#[derive(Serialize, Deserialize)]
pub struct CreateResponse {
    pub id: String,
}

#[derive(Serialize, Deserialize)]
pub struct MetaResponse {
    pub meta: NoteMeta,
}

#[derive(Serialize, Deserialize)]
pub struct NoteResponse {
    pub meta: NoteMeta,
    pub data: Vec<u8>,
}

pub fn generate_id() -> String {
    let mut result = "".to_owned();
    let mut id: [u8; 1] = [0; 1];
    let sr = ring::rand::SystemRandom::new();

    for _ in 0..*config::ID_LENGTH {
        let _ = sr.fill(&mut id);
        result.push_str(&bs62::encode_data(&id));
    }
    result
}