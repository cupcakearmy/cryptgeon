# FRONTEND
FROM node:18-alpine as client 
WORKDIR /tmp
RUN npm install -g pnpm@8
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm run build


# BACKEND
FROM rust:1.73-alpine as backend
WORKDIR /tmp
RUN apk add libc-dev openssl-dev alpine-sdk
COPY ./packages/backend ./
RUN cargo build --release


# RUNNER
FROM alpine
WORKDIR /app
RUN apk add --no-cache curl 
COPY --from=backend /tmp/target/release/cryptgeon .
COPY --from=client /tmp/packages/frontend/build ./frontend
ENV FRONTEND_PATH="./frontend"
ENV REDIS="redis://redis/"
EXPOSE 8000
ENTRYPOINT [ "/app/cryptgeon" ]
