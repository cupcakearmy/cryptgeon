# FRONTEND
FROM node:22-alpine as client 
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /tmp
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm run build

# BACKEND
FROM rust:1.85-alpine as backend
WORKDIR /tmp
RUN apk add --no-cache libc-dev openssl-dev alpine-sdk
COPY ./packages/backend ./
RUN RUSTFLAGS="-Ctarget-feature=-crt-static" cargo build --release

# RUNNER
FROM alpine:3.19
WORKDIR /app
RUN apk add --no-cache curl libgcc redis supervisor
RUN mkdir -p /etc/supervisor/conf.d

COPY --from=backend /tmp/target/release/cryptgeon .
COPY --from=client /tmp/packages/frontend/build ./frontend

RUN echo "[supervisord]" > /etc/supervisor/conf.d/supervisord.conf && \
    echo "nodaemon=true" >> /etc/supervisor/conf.d/supervisord.conf && \
    echo "" >> /etc/supervisor/conf.d/supervisord.conf && \
    echo "[program:redis]" >> /etc/supervisor/conf.d/supervisord.conf && \
    echo "command=/usr/bin/redis-server" >> /etc/supervisor/conf.d/supervisord.conf && \
    echo "autostart=true" >> /etc/supervisor/conf.d/supervisord.conf && \
    echo "autorestart=true" >> /etc/supervisor/conf.d/supervisord.conf && \
    echo "" >> /etc/supervisor/conf.d/supervisord.conf && \
    echo "[program:cryptgeon]" >> /etc/supervisor/conf.d/supervisord.conf && \
    echo "command=/app/cryptgeon" >> /etc/supervisor/conf.d/supervisord.conf && \
    echo "autostart=true" >> /etc/supervisor/conf.d/supervisord.conf && \
    echo "autorestart=true" >> /etc/supervisor/conf.d/supervisord.conf

ENV FRONTEND_PATH="./frontend"
ENV REDIS="redis://localhost:6379"
EXPOSE 8000

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
