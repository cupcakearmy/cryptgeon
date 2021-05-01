use bs62;
use ring::rand::SecureRandom;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
pub struct Note {
  pub contents: String,
  pub password: bool,
  pub views: Option<u8>,
  pub expiration: Option<u16>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct PubNote {
  pub password: bool,
}

pub fn generate_id() -> String {
  let mut id: [u8; 64] = [0; 64];
  let sr = ring::rand::SystemRandom::new();
  let _ = sr.fill(&mut id);
  return bs62::encode_data(&id);
}
