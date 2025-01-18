use std::{collections::HashMap, sync::Arc};

use axum::{
    body::Body,
    extract::{DefaultBodyLimit, Request},
    http::HeaderValue,
    middleware::{self, Next},
    response::Response,
    routing::{delete, get, post},
    Router, ServiceExt,
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

#[tokio::main]
async fn main() {
    dotenv().ok();

    let shared_state = SharedState {
        locks: Arc::new(Mutex::new(HashMap::new())),
    };

    if !store::can_reach_redis() {
        println!("cannot reach redis");
        panic!("cannot reach redis");
    }

    let notes_routes = Router::new()
        .route("/", post(note::create))
        .route("/:id", delete(note::delete))
        .route("/:id", get(note::preview));
    let health_routes = Router::new().route("/live", get(health::report_health));
    let status_routes = Router::new().route("/status", get(status::get_status));
    let api_routes = Router::new()
        .nest("/notes", notes_routes)
        .nest("/", health_routes)
        .nest("/", status_routes);

    let index = format!("{}{}", config::FRONTEND_PATH.to_string(), "/index.html");
    let serve_dir =
        ServeDir::new(config::FRONTEND_PATH.to_string()).not_found_service(ServeFile::new(index));
    let app = Router::new()
        .nest("/api", api_routes)
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
