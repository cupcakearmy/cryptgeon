use bs62;
use ring::rand::SecureRandom;
use serde::{Deserialize, Serialize};

use crate::config;

#[derive(Serialize, Deserialize, Clone)]
pub struct Note {
    pub meta: String,
    pub contents: String,
    pub views: Option<u32>,
    pub expiration: Option<u32>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct NoteInfo {
    pub meta: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct NotePublic {
    pub meta: String,
    pub contents: String,
}

pub fn generate_id() -> String {
    let mut result = "".to_owned();
    let mut id: [u8; 1] = [0; 1];
    let sr = ring::rand::SystemRandom::new();

    for _ in 0..*config::ID_LENGTH {
        let _ = sr.fill(&mut id);
        result.push_str(&bs62::encode_data(&id));
    }
    return result;
}
