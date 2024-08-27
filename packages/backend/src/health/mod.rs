use crate::store;
use axum::http::StatusCode;

pub async fn report_health() -> (StatusCode,) {
    if store::can_reach_redis() {
        return (StatusCode::OK,);
    } else {
        return (StatusCode::SERVICE_UNAVAILABLE,);
    }
}
