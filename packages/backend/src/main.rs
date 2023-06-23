use actix_web::{
    middleware::{self, Logger},
    web::{self},
    App, HttpServer,
};
use dotenv::dotenv;
use log::error;

#[macro_use]
extern crate lazy_static;

mod api;
mod client;
mod config;
mod health;
mod note;
mod size;
mod status;
mod store;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    env_logger::init_from_env(env_logger::Env::new().default_filter_or(config::VERBOSITY.as_str()));

    if !store::can_reach_redis() {
        error!("cannot reach redis");
        panic!("canont reach redis");
    }

    return HttpServer::new(|| {
        App::new()
            .wrap(Logger::new("\"%r\" %s %b %T"))
            .wrap(middleware::Compress::default())
            .wrap(middleware::DefaultHeaders::default())
            .configure(size::init)
            .configure(api::init)
            .configure(client::init)
            .default_service(web::to(client::index))
    })
    .bind(config::LISTEN_ADDR.to_string())?
    .run()
    .await;
}
