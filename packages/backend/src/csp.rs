use axum::{body::Body, extract::Request, http::HeaderValue, middleware::Next, response::Response};

const CUSTOM_HEADER_NAME: &str = "Content-Security-Policy";
const CUSTOM_HEADER_VALUE: &str = "default-src 'self'; script-src 'report-sample' 'self'; style-src 'report-sample' 'self'; object-src 'none'; base-uri 'self'; connect-src 'self' data:; font-src 'self'; frame-src 'self'; img-src 'self'; manifest-src 'self'; media-src 'self'; worker-src 'none';";

lazy_static! {
    static ref HEADER_VALUE: HeaderValue = HeaderValue::from_static(CUSTOM_HEADER_VALUE);
}

pub async fn add_csp_header(request: Request<Body>, next: Next) -> Response {
    let mut response = next.run(request).await;
    response
        .headers_mut()
        .append(CUSTOM_HEADER_NAME, HEADER_VALUE.clone());
    response
}
