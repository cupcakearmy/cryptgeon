use bs62;
use ring::rand::SecureRandom;
use serde::{Deserialize, Serialize};

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
    let mut id: [u8; 32] = [0; 32];
    let sr = ring::rand::SystemRandom::new();
    let _ = sr.fill(&mut id);
    return bs62::encode_data(&id);
}
