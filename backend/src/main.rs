use actix_web::{middleware, web, App, HttpServer};
use dotenv::dotenv;

#[macro_use]
extern crate lazy_static;

mod api;
mod client;
mod config;
mod note;
mod size;
mod status;
mod store;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    return HttpServer::new(|| {
        App::new()
            .wrap(middleware::Compress::default())
            .wrap(middleware::DefaultHeaders::default())
            .configure(size::init)
            .configure(api::init)
            .configure(client::init)
            .default_service(web::to(client::index))
    })
    .bind("0.0.0.0:5000")?
    .run()
    .await;
}
