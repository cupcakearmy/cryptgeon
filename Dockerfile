# Client
FROM node:16-alpine as CLIENT

WORKDIR /tmp
COPY ./frontend ./

RUN npm install -g pnpm
RUN pnpm install
RUN pnpm run build

# Rust
FROM rust:1.56-alpine as RUST

WORKDIR /tmp
RUN apk add libc-dev openssl-dev alpine-sdk
COPY ./backend ./

RUN cargo build --release

# Server
FROM alpine

WORKDIR /app
COPY --from=RUST /tmp/target/release/cryptgeon .
COPY --from=CLIENT /tmp/build ./frontend/build

ENV MEMCACHE=memcached:11211

EXPOSE 5000

ENTRYPOINT [ "/app/cryptgeon" ]
