# FRONTEND
FROM node:20-alpine as client 
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /tmp
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm run build


# BACKEND
FROM rust:1.76-alpine as backend
WORKDIR /tmp
RUN apk add --no-cache libc-dev openssl-dev alpine-sdk
COPY ./packages/backend ./
RUN cargo build --release


# RUNNER
FROM alpine:3.19
WORKDIR /app
RUN apk add --no-cache curl 
COPY --from=backend /tmp/target/release/cryptgeon .
COPY --from=client /tmp/packages/frontend/build ./frontend
ENV FRONTEND_PATH="./frontend"
ENV REDIS="redis://redis/"
EXPOSE 8000
ENTRYPOINT [ "/app/cryptgeon" ]
