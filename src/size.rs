use actix_web::web;
use byte_unit::Byte;

pub fn init(cfg: &mut web::ServiceConfig) {
  let limit_string = std::env::var("SIZE_LIMIT").unwrap_or("1 KiB".to_string());
  let limit = Byte::from_str(limit_string.clone()).unwrap().get_bytes() as usize;
  println!("SIZE_LIMIT: {}, {}", limit_string, limit);
  let config = web::JsonConfig::default().limit(limit);
  cfg.data(config);
}
