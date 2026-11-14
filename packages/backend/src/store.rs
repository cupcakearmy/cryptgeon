use redis::Commands;

use crate::config;

lazy_static! {
    static ref CACHE_URL: String = std::env::var("CACHE")
        .unwrap_or("redis://127.0.0.1/".to_string())
        .parse()
        .unwrap();
}

fn prefixed(id: &str) -> String {
    format!("{}{}", config::CACHE_PREFIX.as_str(), id)
}

fn conn() -> Result<redis::Connection, &'static str> {
    let client =
        redis::Client::open(CACHE_URL.to_string()).map_err(|_| "Unable to connect to cache")?;
    client.get_connection().map_err(|_| "Unable to connect to cache")
}

pub fn can_reach_cache() -> bool {
    conn().is_ok()
}

pub fn set(id: &str, data: &[u8], views: Option<i64>, expiration: Option<u64>, extra: &[u8]) -> Result<(), &'static str> {
    let key = prefixed(id);
    let mut c = conn()?;

    c.hset::<_, _, _, ()>(&key, "data", data).map_err(|_| "Unable to set note")?;
    c.hset::<_, _, _, ()>(&key, "extra", extra).map_err(|_| "Unable to set note")?;

    if let Some(v) = views {
        c.hset::<_, _, _, ()>(&key, "views", v).map_err(|_| "Unable to set note")?;
    }
    if let Some(e) = expiration {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();
        let ttl = e.saturating_sub(now);
        c.hset::<_, _, _, ()>(&key, "expiration", e).map_err(|_| "Unable to set expiration")?;
        c.expire::<_, ()>(&key, ttl as i64).map_err(|_| "Unable to set expiration")?;
    }

    Ok(())
}

pub fn get_meta(id: &str) -> Result<Option<(Option<i64>, Option<u64>, Vec<u8>)>, &'static str> {
    let key = prefixed(id);
    let mut c = conn()?;

    let exists: bool = c.exists::<_, bool>(&key).map_err(|_| "Cache error")?;
    if !exists {
        return Ok(None);
    }

    let views: Option<i64> = c.hget::<_, _, Option<i64>>(&key, "views").map_err(|_| "Cache error")?;
    let expiration: Option<u64> = c.hget::<_, _, Option<u64>>(&key, "expiration").map_err(|_| "Cache error")?;
    let extra: Vec<u8> = c.hget::<_, _, Vec<u8>>(&key, "extra").unwrap_or_default();

    Ok(Some((views, expiration, extra)))
}

pub fn get_data(id: &str) -> Result<Option<Vec<u8>>, &'static str> {
    let key = prefixed(id);
    let mut c = conn()?;
    let data: Option<Vec<u8>> = c.hget::<_, _, Option<Vec<u8>>>(&key, "data").map_err(|_| "Cache error")?;
    Ok(data)
}

/// Atomically consume one view: decrements `views`, deletes the key when the
/// last view is spent, and returns (remaining_views, data, expiration, extra).
/// Returns `Ok(None)` when the note is missing or already exhausted.
pub fn consume(id: &str) -> Result<Option<(i64, Vec<u8>, Option<u64>, Vec<u8>)>, &'static str> {
    const SCRIPT: &str = r#"
local views = redis.call('HGET', KEYS[1], 'views')
if not views then
    return nil
end
views = tonumber(views)
if views <= 0 then
    redis.call('DEL', KEYS[1])
    return { -1, false, false, false }
end
local data = redis.call('HGET', KEYS[1], 'data')
local exp = redis.call('HGET', KEYS[1], 'expiration')
local extra = redis.call('HGET', KEYS[1], 'extra')
local remaining = views - 1
redis.call('HINCRBY', KEYS[1], 'views', -1)
if remaining <= 0 then
    redis.call('DEL', KEYS[1])
end
return { remaining, data, exp, extra }
"#;
    let key = prefixed(id);
    let mut c = conn()?;
    let result: Option<(i64, Option<Vec<u8>>, Option<u64>, Option<Vec<u8>>)> =
        redis::Script::new(SCRIPT)
            .key(&key)
            .invoke(&mut c)
            .map_err(|_| "Cache error")?;
    match result {
        Some((-1, _, _, _)) | None => Ok(None),
        Some((remaining, Some(data), exp, extra)) => {
            Ok(Some((remaining, data, exp, extra.unwrap_or_default())))
        }
        Some((_, None, _, _)) => Ok(None),
    }
}

