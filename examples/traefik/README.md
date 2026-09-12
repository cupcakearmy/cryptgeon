# Install Cryptgeon with Traefik

Assumptions:

- Traefik 2/3 installed.
- External proxy docker network `proxy`.
- A certificate resolver `le`.
- A https entrypoint `secure`.
- Domain name `example.org`.

```yaml

networks:
  proxy:
    external: true

services:
  cache:
    image: valkey/valkey:7-alpine
    # This is required to stay in RAM only.
    command: valkey-server --save "" --appendonly no
    # Set a size limit. See link below on how to customise.
    # https://valkey.io/docs/latest/operate/rs/databases/memory-performance/eviction-policy/
    # --maxmemory 1gb --maxmemory-policy allkeys-lrulpine
    # This prevents the creation of an anonymous volume.
    tmpfs:
      - /data

  app:
    image: cupcakearmy/cryptgeon:latest
    restart: unless-stopped
    depends_on:
      - cache
    networks:
      - default
      - proxy
    labels:
      - traefik.enable=true
      - traefik.http.routers.cryptgeon.rule=Host(`example.org`)
      - traefik.http.routers.cryptgeon.entrypoints=secure
      - traefik.http.routers.cryptgeon.tls.certresolver=le
```

## With basic auth

Some times it's useful to hide the service behind auth. This is easily achieved with traefik middleware. Many reverse proxies support similar features, so while traefik is used in this example, other reverse proxies can do the same.

```yaml
services:
  traefik:
    image: traefik:v3.0
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
    ports:
      - "80:80"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"

  cache:
    image: valkey/valkey:7-alpine
    # This is required to stay in RAM only.
    command: valkey-server --save "" --appendonly no
    # Set a size limit. See link below on how to customise.
    # https://valkey.io/docs/latest/operate/rs/databases/memory-performance/eviction-policy/
    # --maxmemory 1gb --maxmemory-policy allkeys-lrulpine
    # This prevents the creation of an anonymous volume.
    tmpfs:
      - /data

  cryptgeon:
    image: cupcakearmy/cryptgeon
    depends_on:
      - cache
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.cryptgeon.rule=Host(`cryptgeon.localhost`)"
      - "traefik.http.routers.cryptgeon.entrypoints=web"
      - "traefik.http.routers.cryptgeon.middlewares=cryptgeon-auth"
      - "traefik.http.middlewares.cryptgeon-auth.basicauth.users=user:$$2y$$05$$juUw0zgc5ebvJ00MFPVVLujF6P.rcEMbGZ99Jfq6ZWEa1dgetacEq"
```

```bash
docker compose up -d
```

1. Open http://cryptgeon.localhost
2. Log in with `user` and `secret`
