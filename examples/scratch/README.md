# Install from scratch.

This is a tiny guide to install cryptgeon on (probably) any unix system (and maybe windows?) from scratch using traefik as the proxy, which will manage certificates and handle https for us.

1. Install Docker & Docker Compose.
2. Install Traefik.
3. Run the cryptgeon.
4. [Optional] install watchtower to keep up to date.

## Install Docker & Docker Compose

- [Docker](https://docs.docker.com/engine/install/)
- [Compose](https://docs.docker.com/compose/install/)

## Install Traefik 2.0

[Traefik](https://doc.traefik.io/traefik/) is a router & proxy that makes deployment of containers incredibly easy. It will manage all the https certificates, routing, etc.

```sh
/foo/bar/traefik/
├── docker-compose.yaml
└── traefik.yaml
```

```yaml
# docker-compose.yaml

version: '3.8'
services:
  traefik:
    image: traefik:2.6
    restart: unless-stopped
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./traefik.yaml:/etc/traefik/traefik.yaml:ro
      - ./data:/data
    labels:
      - 'traefik.enable=true'

      # HTTP to HTTPS redirection
      - 'traefik.http.routers.http_catchall.rule=HostRegexp(`{any:.+}`)'
      - 'traefik.http.routers.http_catchall.entrypoints=insecure'
      - 'traefik.http.routers.http_catchall.middlewares=https_redirect'
      - 'traefik.http.middlewares.https_redirect.redirectscheme.scheme=https'
      - 'traefik.http.middlewares.https_redirect.redirectscheme.permanent=true'

networks:
  default:
    external: true
    name: proxy
```

```yaml
# traefik.yaml

api:
  dashboard: true

# Define HTTP and HTTPS entrypoint
entryPoints:
  insecure:
    address: ':80'
  secure:
    address: ':443'

# Dynamic configuration will come from docker labels
providers:
  docker:
    endpoint: 'unix:///var/run/docker.sock'
    network: 'proxy'
    exposedByDefault: false

# Enable acme with http file challenge
certificatesResolvers:
  le:
    acme:
      email: me@example.org
      storage: /data/acme.json
      httpChallenge:
        entryPoint: insecure
```

**Run**

```sh
docker network create proxy
docker-compose up -d
```

## Cryptgeon

Create another docker-compose.yaml file in another folder. We will assume that the domain is `cryptgeon.example.org`.

```sh
/foo/bar/cryptgeon/
└── docker-compose.yaml
```

```yaml
version: '3.8'

networks:
  proxy:
    external: true

services:
  redis:
    image: redis:7-alpine
    # This is required to stay in RAM only.
    command: redis-server --save "" --appendonly no
    # Set a size limit. See link below on how to customise.
    # https://redis.io/docs/latest/operate/rs/databases/memory-performance/eviction-policy/
    # --maxmemory 1gb --maxmemory-policy allkeys-lrulpine
    # This prevents the creation of an anonymous volume.
    tmpfs:
      - /data

  app:
    image: cupcakearmy/cryptgeon:latest
    restart: unless-stopped
    depends_on:
      - redis
    environment:
      SIZE_LIMIT: 4 MiB
    networks:
      - default
      - proxy
    labels:
      - traefik.enable=true
      - traefik.http.routers.cryptgeon.rule=Host(`cryptgeon.example.org`)
      - traefik.http.routers.cryptgeon.entrypoints=secure
      - traefik.http.routers.cryptgeon.tls.certresolver=le
```

**Run**

```sh
docker-compose up -d
```

## Watchtower

> A container-based solution for automating Docker container base image updates.

[Watchtower](https://containrrr.dev/watchtower/) will keep our containers up to date. The interval is set to once a day and also configured to delete old images to prevent cluttering.

```sh
/foo/bar/watchtower/
└── docker-compose.yaml
```

```yaml
# docker-compose.yaml

version: '3.8'

services:
  watchtower:
    image: containrrr/watchtower
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    command: --cleanup --interval 86400
```
