use axum::{
    http::HeaderValue,
    response::{Html, IntoResponse, Response},
};
use ring::rand::SecureRandom;
use std::sync::OnceLock;

const CSP_POLICY: &str = "default-src 'self'; script-src 'nonce-{nonce}' 'strict-dynamic'; style-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self'; connect-src 'self'";

fn index_html() -> &'static str {
    static HTML: OnceLock<String> = OnceLock::new();
    HTML.get_or_init(|| {
        let path = format!("{}index.html", *crate::config::FRONTEND_PATH);
        std::fs::read_to_string(&path).expect("Failed to read index.html for CSP injection")
    })
}

fn generate_nonce() -> String {
    let rng = ring::rand::SystemRandom::new();
    let mut bytes = [0u8; 32];
    rng.fill(&mut bytes).expect("Failed to generate CSP nonce");
    bs62::encode_data(&bytes)
}

pub async fn spa_fallback() -> Response {
    let nonce = generate_nonce();
    let csp = CSP_POLICY.replace("{nonce}", &nonce);
    let html = index_html().replace("<script>", &format!("<script nonce=\"{}\">", nonce));

    let mut response = Html(html).into_response();
    response
        .headers_mut()
        .insert("Content-Security-Policy", HeaderValue::from_str(&csp).unwrap());
    response
}