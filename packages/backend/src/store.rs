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

pub fn has_views(id: &str) -> Result<bool, &'static str> {
    let key = prefixed(id);
    let mut c = conn()?;
    let has: bool = c.hexists::<_, _, bool>(&key, "views").map_err(|_| "Cache error")?;
    Ok(has)
}

pub fn decrement_views(id: &str) -> Result<i64, &'static str> {
    let key = prefixed(id);
    let mut c = conn()?;
    let result: i64 = c.hincr::<_, _, _, i64>(&key, "views", -1).map_err(|_| "Cache error")?;
    Ok(result)
}

pub fn del(id: &str) -> Result<(), &'static str> {
    let key = prefixed(id);
    let mut c = conn()?;
    c.del::<_, ()>(&key).map_err(|_| "Unable to delete note")?;
    Ok(())
}