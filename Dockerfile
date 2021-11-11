FROM node:16-alpine as CLIENT

WORKDIR /tmp
COPY ./client ./

RUN npm install -g pnpm
RUN pnpm install
RUN pnpm run build

FROM rust:1.51-alpine as RUST

WORKDIR /tmp
RUN apk add libc-dev openssl-dev alpine-sdk
COPY ./Cargo* ./
COPY ./src ./src

RUN cargo build --release

FROM scratch

WORKDIR /app
COPY --from=RUST /tmp/target/release/cryptgeon .
COPY --from=CLIENT /tmp/build ./client/build

ENV MEMCACHE=memcached:11211

EXPOSE 5000

ENTRYPOINT [ "/app/cryptgeon" ]
