use actix_web::{get, web, HttpResponse, Responder, Scope};

use crate::store;

#[get("/")]
async fn get_live() -> impl Responder {
    if store::can_reach_redis() {
        return HttpResponse::Ok();
    } else {
        return HttpResponse::ServiceUnavailable();
    }
}

pub fn init() -> Scope {
    web::scope("/live").service(get_live)
}
