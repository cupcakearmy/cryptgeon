# Install Cryptgeon with Traefik

Assumptions:

- Traefik 2 installed.
- External proxy docker network `proxy`.
- A certificate resolver `le`.
- A https entrypoint `secure`.
- Domain name `example.org`.

```yaml
version: '3.8'

networks:
  proxy:
    external: true

services:
  redis:
    image: redis:7-alpine
    restart: unless-stopped

  app:
    image: cupcakearmy/cryptgeon:latest
    restart: unless-stopped
    depends_on:
      - redis
    networks:
      - default
      - proxy
    labels:
      - traefik.enable=true
      - traefik.http.routers.cryptgeon.rule=Host(`example.org`)
      - traefik.http.routers.cryptgeon.entrypoints=secure
      - traefik.http.routers.cryptgeon.tls.certresolver=le
```
