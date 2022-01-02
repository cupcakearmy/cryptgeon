use actix_web::{middleware, web, App, HttpServer};
use dotenv::dotenv;

#[macro_use]
extern crate lazy_static;

mod client;
mod note;
mod size;
mod store;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    return HttpServer::new(|| {
        App::new()
            .wrap(middleware::Compress::default())
            .wrap(middleware::DefaultHeaders::default())
            .configure(size::init)
            .configure(note::init)
            .configure(client::init)
            .default_service(web::resource("").route(web::get().to(client::fallback_fn)))
    })
    .bind("0.0.0.0:5000")?
    .run()
    .await;
}
