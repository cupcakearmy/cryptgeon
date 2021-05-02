use memcache;

use crate::note::Note;

lazy_static! {
  static ref CLIENT: memcache::Client =
    memcache::connect("memcache://127.0.0.1:11211?timeout=10&tcp_nodelay=true").unwrap();
}

pub fn set(id: &String, note: &Note) {
  let serialized = serde_json::to_string(&note.clone()).unwrap();
  CLIENT.set(id, serialized, 0).unwrap();
}

pub fn get(id: &String) -> Option<Note> {
  let value: Option<String> = CLIENT.get(&id).unwrap();
  match value {
    None => return None,
    Some(s) => {
      let deserialize: Note = serde_json::from_str(&s).unwrap();
      return Some(deserialize);
    }
  }
}

pub fn del(id: &String) {
  CLIENT.delete(id).unwrap();
}
