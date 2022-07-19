# FRONTEND
FROM node:16-alpine as client 
WORKDIR /tmp
RUN npm install -g pnpm@7
COPY ./frontend ./
RUN pnpm install
RUN pnpm exec svelte-kit sync
RUN pnpm run build


# BACKEND
FROM rust:1.61-alpine as backend
WORKDIR /tmp
RUN apk add libc-dev openssl-dev alpine-sdk
COPY ./backend ./
RUN cargo build --release


# RUNNER
FROM alpine
WORKDIR /app
COPY --from=backend /tmp/target/release/cryptgeon .
COPY --from=client /tmp/build ./frontend/build
ENV REDIS=redis://redis/
EXPOSE 5000
ENTRYPOINT [ "/app/cryptgeon" ]
