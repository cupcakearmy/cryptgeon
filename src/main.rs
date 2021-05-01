use actix_web::{middleware, App, HttpServer};

#[macro_use]
extern crate lazy_static;

mod note;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .wrap(middleware::Compress::default())
            .wrap(middleware::DefaultHeaders::default())
            .configure(note::init)
    })
    .bind("127.0.0.1:5000")?
    .run()
    .await
}
