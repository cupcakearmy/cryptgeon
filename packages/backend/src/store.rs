use redis;
use redis::Commands;

use crate::note::now;
use crate::note::Note;

lazy_static! {
    static ref REDIS_CLIENT: String = std::env::var("REDIS")
        .unwrap_or("redis://127.0.0.1/".to_string())
        .parse()
        .unwrap();
}

fn get_connection() -> Result<redis::Connection, &'static str> {
    let client =
        redis::Client::open(REDIS_CLIENT.to_string()).map_err(|_| "Unable to connect to redis")?;
    client
        .get_connection()
        .map_err(|_| "Unable to connect to redis")
}

pub fn can_reach_redis() -> bool {
    let conn = get_connection();
    return match conn {
        Ok(_) => true,
        Err(_) => false,
    };
}

pub fn set(id: &String, note: &Note) -> Result<(), &'static str> {
    let serialized = serde_json::to_string(&note.clone()).unwrap();
    let mut conn = get_connection()?;

    conn.set(id, serialized)
        .map_err(|_| "Unable to set note in redis")?;
    match note.expiration {
        Some(e) => {
            let seconds = e - now();
            conn.expire(id, seconds as i64)
                .map_err(|_| "Unable to set expiration on notion")?
        }
        None => {}
    };
    Ok(())
}

pub fn get(id: &String) -> Result<Option<Note>, &'static str> {
    let mut conn = get_connection()?;
    let value: Option<String> = conn.get(id).map_err(|_| "Could not load note in redis")?;
    match value {
        None => return Ok(None),
        Some(s) => {
            let deserialize: Note = serde_json::from_str(&s).unwrap();
            return Ok(Some(deserialize));
        }
    }
}

pub fn del(id: &String) -> Result<(), &'static str> {
    let mut conn = get_connection()?;
    conn.del(id).map_err(|_| "Unable to delete note in redis")?;
    Ok(())
}
