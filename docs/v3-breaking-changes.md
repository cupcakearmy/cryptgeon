# v3 Breaking Changes

A list of changes users and operators need to consider when upgrading from v2 to v3.

## API

- All note endpoints moved under `/api/v3/notes/` (was `/api/notes/`)
- Status endpoint moved to `/api/v3/status` (was `/api/status`)
- All request/response bodies are now **MessagePack** (`Content-Type: application/msgpack`), not JSON
- Health check moved to `/healthz` (was `/api/live`)
- Notes can now have **both** `views` and `expiration` set simultaneously (previously mutually exclusive)

## API payload structure

The wire format changed entirely. v2 used:

```json
{ "contents": "<encrypted string>", "meta": "<stringified JSON>", "views": 5, "expiration": 30 }
```

v3 uses msgpack:

```
{ meta: { views?, expiration?, extra? }, data: <encrypted bytes> }
```

- `meta.extra` holds client-opaque data (e.g. scrypt derivation params), size-limited (default 512 bytes)
- `data` is the encrypted blob — the server never inspects its contents
- The encrypted inner payload is itself msgpack: `{ type: "text", data: string }` or `{ type: "files", data: [{ name, mime, size, data }] }`

## Environment variables

| v2                  | v3                   |
| ------------------- | -------------------- |
| `REDIS`             | `CACHE`              |
| `REDIS_PREFIX`      | `CACHE_PREFIX`       |
| _(new)_             | `EXTRA_SIZE_LIMIT`   |

The `CACHE` env var accepts any RESP-compatible URL (valkey or redis).
`EXTRA_SIZE_LIMIT` (default `512`) limits the `extra` field size in bytes.

## Docker / Compose

- The `redis` service in docker-compose is renamed to `cache`
- Healthcheck URL updated: `http://127.0.0.1:8000/api/live/` → `http://127.0.0.1:8000/healthz`
- The default image stays `valkey/valkey:7-alpine` but operators can swap for any redis-compatible image

## CLI (`cryptgeon` npm package)

- Dropped `occulto` dependency — now uses `@noble/ciphers` + `@noble/hashes` internally
- Encryption changed from AES to **XChaCha20-Poly1305**
- The local `shared/` module removed — now imports from `@cryptgeon/shared` (workspace-internal)
- Notes created with v2 (AES) are **not readable** by v3 and vice versa

## Frontend

- Dropped `occulto` dependency
- Package import changed from `cryptgeon/shared` to `@cryptgeon/shared`
- Notes created in v2 are not accessible from the v3 frontend

## Storage

- Cache storage format changed from JSON blobs to hashes with atomic `HINCRBY` for view counting
- The per-note lock (`lock.rs`) is removed — no longer needed
- Existing v2 notes in cache are **not migrated** and will be inaccessible after upgrade
- Ensure cache is empty (or flush) before deploying v3
