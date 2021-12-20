use actix_web::{middleware, web, App, HttpServer};

#[macro_use]
extern crate lazy_static;

mod client;
mod note;
mod size;
mod store;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    return HttpServer::new(|| {
        App::new()
            // .configure(|cfg: &mut web::ServiceConfig| {
            //     let limit_string = std::env::var("SIZE_LIMIT").unwrap_or("0.1 KiB".to_string());
            //     let limit = Byte::from_str(limit_string.clone()).unwrap().get_bytes() as usize;
            //     println!("SIZE_LIMIT: {}, {}", limit_string, limit);
            //     let config = web::JsonConfig::default().limit(limit);
            //     cfg.data(config);
            // })
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
