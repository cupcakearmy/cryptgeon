use byte_unit::Byte;

// General
lazy_static! {
    pub static ref VERSION: String = option_env!("CARGO_PKG_VERSION")
        .unwrap_or("Unknown")
        .to_string();
}

// CONFIG
lazy_static! {
  pub static ref LIMIT: usize =
    Byte::from_str(std::env::var("SIZE_LIMIT").unwrap_or("1 KiB".to_string()))
      .unwrap()
      .get_bytes() as usize;
  pub static ref MAX_VIEWS: u32 = std::env::var("MAX_VIEWS")
    .unwrap_or("100".to_string())
    .parse()
    .unwrap();
  pub static ref MAX_EXPIRATION: u32 = std::env::var("MAX_EXPIRATION")
    .unwrap_or("360".to_string()) // 6 hours in minutes
    .parse()
    .unwrap();
  pub static ref ALLOW_ADVANCED: bool = std::env::var("ALLOW_ADVANCED")
    .unwrap_or("true".to_string())
    .parse()
    .unwrap();
}

// THEME
lazy_static! {
    pub static ref THEME_IMAGE: String = std::env::var("THEME_IMAGE")
        .unwrap_or("".to_string())
        .parse()
        .unwrap();
    pub static ref THEME_TEXT: String = std::env::var("THEME_TEXT")
        .unwrap_or("".to_string())
        .parse()
        .unwrap();
}
