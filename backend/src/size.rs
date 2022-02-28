use actix_web::web;
use byte_unit::Byte;
use mime;

lazy_static! {
  pub static ref LIMIT: usize =
    Byte::from_str(std::env::var("SIZE_LIMIT").unwrap_or("1 KiB".to_string()))
      .unwrap()
      .get_bytes() as usize;
}

pub fn init(cfg: &mut web::ServiceConfig) {
  let json = web::JsonConfig::default().limit(*LIMIT);
  let plain = web::PayloadConfig::default()
    .limit(*LIMIT)
    .mimetype(mime::STAR_STAR);
  cfg.app_data(json).app_data(plain);
}
