use std::{collections::HashMap, sync::Arc};
use base64::Engine;
use reqwest;

use axum::{
    Router, ServiceExt,
    extract::{DefaultBodyLimit, Request},
    routing::{delete, get, post},
};
use dotenv::dotenv;
use lock::SharedState;
use tokio::sync::Mutex;
use tower::Layer;
use tower_http::{
    compression::CompressionLayer,
    normalize_path::NormalizePathLayer,
    services::{ServeDir, ServeFile},
};

#[macro_use]
extern crate lazy_static;

mod config;
mod csp;
mod health;
mod lock;
mod note;
mod status;
mod store;

fn is_svg_content(s: &str) -> bool {
    let t = s.trim_start();
    t.starts_with("<svg") || (t.starts_with("<?xml") && t.contains("<svg"))
}

fn mime_from_path(path: &str) -> &'static str {
    let lower = path.to_lowercase();
    if lower.ends_with(".png") { "image/png" }
    else if lower.ends_with(".jpg") || lower.ends_with(".jpeg") { "image/jpeg" }
    else if lower.ends_with(".gif") { "image/gif" }
    else if lower.ends_with(".webp") { "image/webp" }
    else if lower.ends_with(".ico") { "image/x-icon" }
    else if lower.ends_with(".bmp") { "image/bmp" }
    else { "application/octet-stream" }
}

async fn resolve_theme_image(value: &str) {
    if value.is_empty() {
        return;
    }

    if let Some(rest) = value.strip_prefix("data:") {
        // Base64 or raw data URL: data:[mediatype][;base64],<data>
        let (header, data) = rest.split_once(',')
            .unwrap_or_else(|| panic!("Invalid data URL format in THEME_IMAGE"));
        if header.contains("svg") {
            let svg = if header.contains(";base64") {
                let bytes = base64::engine::general_purpose::STANDARD.decode(data)
                    .unwrap_or_else(|e| panic!("Invalid base64 in THEME_IMAGE: {e}"));
                String::from_utf8(bytes)
                    .unwrap_or_else(|e| panic!("Invalid UTF-8 in THEME_IMAGE SVG data: {e}"))
            } else {
                data.to_string()
            };
            config::THEME_RESOLVED_SVG.set(svg).unwrap();
        } else {
            config::THEME_RESOLVED_IMAGE.set(value.to_string()).unwrap();
        }
    } else if value.starts_with("http://") || value.starts_with("https://") {
        let response = reqwest::get(value)
            .await
            .unwrap_or_else(|e| panic!("Failed to fetch THEME_IMAGE from {value}: {e}"));
        let is_svg_ct = response.headers()
            .get("content-type")
            .and_then(|v| v.to_str().ok())
            .map(|ct| ct.contains("svg"))
            .unwrap_or(false);
        let content = response.text()
            .await
            .unwrap_or_else(|e| panic!("Failed to read THEME_IMAGE response: {e}"));
        if is_svg_ct || is_svg_content(&content) {
            config::THEME_RESOLVED_SVG.set(content).unwrap();
        } else {
            config::THEME_RESOLVED_IMAGE.set(value.to_string()).unwrap();
        }
    } else {
        // Local file path
        let bytes = std::fs::read(value)
            .unwrap_or_else(|e| panic!("Cannot read THEME_IMAGE file {value}: {e}"));
        let is_svg = value.to_lowercase().ends_with(".svg")
            || std::str::from_utf8(&bytes).map(is_svg_content).unwrap_or(false);
        if is_svg {
            let content = String::from_utf8(bytes)
                .unwrap_or_else(|e| panic!("Invalid UTF-8 in THEME_IMAGE SVG file: {e}"));
            config::THEME_RESOLVED_SVG.set(content).unwrap();
        } else {
            let mime = mime_from_path(value);
            let encoded = base64::engine::general_purpose::STANDARD.encode(&bytes);
            config::THEME_RESOLVED_IMAGE.set(format!("data:{mime};base64,{encoded}")).unwrap();
        }
    }
}

#[tokio::main]
async fn main() {
    dotenv().ok();

    let shared_state = SharedState {
        locks: Arc::new(Mutex::new(HashMap::new())),
    };

    resolve_theme_image(config::THEME_IMAGE.as_str()).await;

    if !store::can_reach_redis() {
        println!("cannot reach redis");
        panic!("cannot reach redis");
    }

    let notes_routes = Router::new()
        .route("/", post(note::create))
        .route("/{id}", delete(note::delete))
        .route("/{id}", get(note::preview));
    let health_routes = Router::new().route("/live", get(health::report_health));
    let status_routes = Router::new().route("/status", get(status::get_status));
    let api_routes = Router::new()
        .nest("/notes", notes_routes)
        .merge(health_routes)
        .merge(status_routes);

    let index = format!("{}{}", config::FRONTEND_PATH.to_string(), "/index.html");
    let serve_dir =
        ServeDir::new(config::FRONTEND_PATH.to_string()).not_found_service(ServeFile::new(index));
    let mut app = Router::new()
        .nest("/api", api_routes);
    if !config::THEME_CUSTOM_CSS_FILE.is_empty() {
        app = app.route_service("/custom.css", ServeFile::new(config::THEME_CUSTOM_CSS_FILE.as_str()));
    }
    let app = app
        .fallback_service(serve_dir)
        // Disabled for now, as svelte inlines scripts
        // .layer(middleware::from_fn(csp::add_csp_header))
        .layer(DefaultBodyLimit::max(*config::LIMIT))
        .layer(
            CompressionLayer::new()
                .br(true)
                .deflate(true)
                .gzip(true)
                .zstd(true),
        )
        .with_state(shared_state);

    let app = NormalizePathLayer::trim_trailing_slash().layer(app);

    let listener = tokio::net::TcpListener::bind(config::LISTEN_ADDR.to_string())
        .await
        .unwrap();
    println!("listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, ServiceExt::<Request>::into_make_service(app))
        .await
        .unwrap();
}
