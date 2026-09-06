# v3 Plan

> Status: **Draft** — agreed on architecture, schema open for iteration.
>
> See also: [v3 Breaking Changes](./v3-breaking-changes.md) for the upgrade guide.

## Goals

- **XChaCha20-Poly1305** for encryption (replaces AES/`occulto`)
- **MessagePack** for all API request/response bodies (replaces JSON)
- **LZ4 compression** for note payloads (client-side, before encryption — pure JS, no wasm)
- **Cache hashes** (valkey or redis, both speak RESP) for storage — replaces JSON-blob-per-key
- **Clean break** from v1 — no backward compatibility, no v1 routes
- Remove all Redis references (env vars, service names, docs) in favor of the generic "cache" naming, so operators can choose valkey or redis
- Shared TypeScript package as the single source of truth for crypto + API client + types

## Non-goals

- Keeping v1 alive alongside v3
- Changing the backend language/framework (stays Rust + axum)
- Changing storage backend (stays valkey or redis via the `redis` crate — no separate crate)
- Publishing `@cryptgeon/shared` as a standalone npm package (workspace-internal for now)

---

## 1. Shared package — `@cryptgeon/shared`

Location: `packages/shared` (currently empty).

ESM-only, TypeScript-only. Consumed by both `packages/cli` and `packages/frontend` via workspace dependency.

### Dependencies

- `@noble/ciphers` — XChaCha20-Poly1305
- `@noble/hashes` — scrypt
- `@msgpack/msgpack` — encode/decode
- `lz4js` — LZ4 compression (pure JS, no wasm)
- `ky` — HTTP client

### Structure

```
packages/shared/src/
  index.ts            # re-exports
  crypto.ts           # key derivation, encrypt, decrypt
  compression.ts      # LZ4 compress / decompress
  types.ts            # Note, NoteMetadata, FileDTO, Status, etc.
  api.ts              # high-level client: create, info, view, status
  api.test.ts         # tests
  crypto.test.ts      # tests
  compression.test.ts # tests
```

### `crypto.ts`

- `deriveKey(password: string): Uint8Array` — scrypt, N=2^15, r=8, p=1, dkLen=32, fixed app-specific salt
- `generateKey(): Uint8Array` — `randomBytes(32)`
- `encrypt(data: Uint8Array, key: Uint8Array): Uint8Array` — `managedNonce(xchacha20poly1305)(key).encrypt(data)`
- `decrypt(ciphertext: Uint8Array, key: Uint8Array): Uint8Array` — `managedNonce(xchacha20poly1305)(key).decrypt(ciphertext)`

> **Note (carried over from msgpack branch):** the v2 stub had a bug — `decrypt` passed `key` as a second arg to `chacha.decrypt`, which only takes ciphertext. v3 must not repeat this.

### `compression.ts`

- `compress(data: Uint8Array): Uint8Array` — LZ4 block format
- `decompress(data: Uint8Array): Uint8Array` — LZ4 block format

Compression is a **client-only** concern. The server never sees or knows about compression — it stores the encrypted `data` blob as opaque bytes. The pipeline is:

```
msgpack encode → LZ4 compress → XChaCha20-Poly1305 encrypt
XChaCha20-Poly1305 decrypt → LZ4 decompress → msgpack decode
```

Compression runs on the plaintext (inner msgpack), never on ciphertext — encrypted data is high-entropy and incompressible. Always-on for v3 (all clients share the same package, no interop flag needed).

### `api.ts`

High-level client. All requests/responses are msgpack (`Content-Type: application/msgpack`). Methods:

- `setOptions({ server })` / `getOptions()`
- `create(note, key): Promise<{ id: string }>` — encodes msgpack, compresses (LZ4), encrypts, POST `/api/v3/notes/`
- `info(id): Promise<NoteInfo>` — GET `/api/v3/notes/{id}`, returns metadata only (no `data`)
- `view(id, key): Promise<NotePublic>` — DELETE `/api/v3/notes/{id}`, decrypts `data`, decompresses (LZ4), decodes msgpack
- `status(): Promise<Status>` — GET `/api/v3/status` (still JSON — server config, not note data)

---

## 2. Backend (Rust)

### 2.1 Storage — `store.rs` rewrite

Switch from JSON-blob-per-key to **cache hashes** (valkey or redis, both speak RESP):

```
Key:   {CACHE_PREFIX}{id}
Fields:
  views       (i32)       # remaining views, or absent
  expiration  (u32)       # unix timestamp, or absent
  type        ("text"|"file")
  derivation  (msgpack bytes, optional)  # scrypt salt+params if password-based
  data        (bytes)     # encrypted msgpack blob
```

Functions:

- `set(id, note)` → `HSET` all fields + `EXPIRE` (if time-limited)
- `get_meta(id)` → `HMGET views expiration type derivation` — never touches `data` (cheap preview)
- `get_data(id)` → `HGET data` — only when consuming
- `decrement_view(id)` → `HINCRBY views -1` — **atomic**, see 2.2
- `del(id)` → `DEL`
- `can_reach_cache()` — health check (renamed from `can_reach_redis`)

Use `rmp-serde` for msgpack (de)serialization of note structs.

### 2.2 Remove `lock.rs`

The per-id `Mutex` map in `SharedState` existed only because the consume endpoint did non-atomic read-modify-write on `views`. With `HINCRBY` this is atomic at the cache level.

- Delete `packages/backend/src/lock.rs`
- Remove `SharedState` from `main.rs` (the `.with_state(shared_state)` call)
- Remove the lock map + `Arc`/`Mutex` imports

### 2.3 Rewrite `note/`

- `model.rs` — msgpack-compatible structs (derive `Serialize`/`Deserialize` for `rmp-serde`)
- `routes.rs` — three handlers:

#### `create` — `POST /api/v3/notes/`

- Accepts `application/msgpack` body (raw `Bytes`)
- Deserialize with rmp-serde
- Validate:
  - At least one of `views`/`expiration` must be set
  - `views` ≤ `MAX_VIEWS` and ≥ 1
  - `expiration` ≤ `MAX_EXPIRATION` (minutes) and ≥ 1
  - If `ALLOW_ADVANCED=false`: force `views=1, expiration=None`
- Store via `store::set`
- Return `{ id }` as msgpack

#### `preview` (info) — `GET /api/v3/notes/{id}`

- `store::get_meta(id)` — does not load `data`
- Return metadata as msgpack (no `data` field)
- `404` if not found

#### `view` (consume) — `DELETE /api/v3/notes/{id}`

- If `views` is set:
  - `HINCRBY views -1` (atomic)
  - If result ≤ 0: `HGET data`, `DEL` key, return data
  - If result > 0: `HGET data`, return data (note survives for remaining views)
- If `views` is not set (time-only):
  - `HGET data`, `DEL` key, return data
- Expiration handled lazily by cache (`EXPIRE` on the key) — no manual `if e < n` check on read

### 2.4 Config — `config.rs`

Rename:
- `REDIS` env → `CACHE`
- `REDIS_PREFIX` → `CACHE_PREFIX`
- `REDIS_CLIENT` static → `CACHE_CLIENT`

Everything else stays.

### 2.5 Health — `health/mod.rs`

- Rename `can_reach_redis` → `can_reach_cache`. Update panic message in `main.rs`.
- Move route from `/api/live` to `/healthz` (k8s standard). Not under `/api/v3/` — health checks are infrastructure, not API surface.

### 2.6 Status — `status/mod.rs`

Keep as JSON. It's server configuration, not note data — msgpack adds nothing. Frontend fetches once on load.

### 2.7 Dependencies — `Cargo.toml`

- Add `rmp-serde` (msgpack)
- Remove `serde_json` if no longer used (status endpoint still uses `Json<T>` which needs `serde_json` — keep)
- Keep `redis` crate (RESP client, works with valkey and redis)

---

## 3. "Both" constraint (views AND expiration)

New in v3: a note can have **both** `views` and `expiration` set simultaneously.

Implementation:
- `views` decremented via `HINCRBY views -1` on each consume
- `expiration` set via key-level `EXPIRE` (unix timestamp → seconds remaining)
- Whichever trips first removes the note:
  - Views hit 0 → we `DEL` on the last consume
  - Time expires → cache lazily removes the key
- No read-time expiration check needed in application code

---

## 4. Infra / docs cleanup

- `docker-compose.dev.yaml`: rename `redis` service → `cache` (image stays `valkey/valkey:7-alpine`, operators can swap for redis)
- `docker-compose.yaml` (if present): same
- `Dockerfile`: `ENV REDIS=...` → `ENV CACHE=...`
- `package.json` (root): `dev:docker` script service name
- `README.md`, `README_ES.md`, `README_zh-CN.md`, `CONTRIBUTING.md`, `CHANGELOG.md`, `examples/*` — replace "redis" with "cache" (or "valkey/redis" where context calls for naming the implementation)
- `Cryptgeon.postman_collection.json` — update content types to `application/msgpack`
- `.env.dev` — update `REDIS` → `CACHE` if present
- Healthcheck URLs: update all `/api/live` references → `/healthz` (docker-compose files, README, postman collection)

---

## 5. CLI (`packages/cli`)

- Drop `occulto` dependency
- Delete `packages/cli/src/shared/` (api.ts, adapters.ts, shared.ts) — replaced by `@cryptgeon/shared`
- `actions/upload.ts` and `actions/download.ts` call into `@cryptgeon/shared` API client
- Package still published as `cryptgeon` on npm
- `@cryptgeon/shared` stays workspace-internal (not published) for now

---

## 6. Frontend (`packages/frontend`)

- Drop `occulto` dependency
- Import from `@cryptgeon/shared` instead of `cryptgeon/shared`
- Update `package.json`: `"cryptgeon": "workspace:*"` → `"@cryptgeon/shared": "workspace:*"`
- Update files:
  - `src/lib/views/Create.svelte`
  - `src/lib/ui/ShowNote.svelte`
  - `src/lib/ui/FileUpload.svelte`
  - `src/lib/ui/PastedFilesPreview.svelte`
  - `src/lib/ui/AdvancedParameters.svelte`
  - `src/lib/stores/status.ts`
  - `src/routes/note/[id]/+page.svelte`

---

## 7. msgpack note schema — "matrioshka" design

The server is **agnostic to the content**. It only sees an outer envelope with metadata and an opaque encrypted blob. The content type (text vs. files) lives inside the encrypted inner layer, invisible to the server.

### Outer layer (server-visible)

```
{
  meta: {
    expiration: u32?     # optional, unix timestamp
    views: u32?           # optional, remaining view count
    extra: bytes?         # optional, client-opaque, size-limited
  }
  data: bytes             # encrypted inner msgpack blob
}
```

- `meta.expiration` / `meta.views`: at least one must be set; both can be set simultaneously (see section 3)
- `meta.extra`: opaque client-owned data the server stores and returns verbatim in preview, but never interprets. Used for `derivation` (scrypt salt + params) so the client knows at preview time whether to prompt for a password. Size-limited (e.g. 512 bytes) to prevent abuse.

### Inner layer (encrypted, client-only)

Inside the encrypted `data` blob, after decryption, is a msgpack union:

```
# Text note
{ type: "text", data: string }

# File note
{ type: "files", data: [{ name: string, mime: string, data: bytes }] }
```

The server never sees this structure — it stores/retrieves `data` as opaque bytes.

The inner msgpack blob is **LZ4-compressed before encryption** (see `compression.ts`). Full client pipeline: `msgpack encode → lz4 compress → xchacha20poly1305 encrypt`, reversed on consume. The server is unaware of compression — it only ever handles the encrypted `data` bytes.

### Endpoints

#### `POST /api/v3/notes/` — create

**Request** (msgpack): outer layer `{ meta: { expiration?, views?, extra? }, data }`

**Response** (msgpack): `{ id: string }`

#### `GET /api/v3/notes/{id}` — preview / info

**Response** (msgpack): `{ meta: { expiration?, views?, extra? } }`

Returns metadata only — does not load `data` from cache. Client inspects `meta.extra` to determine key derivation strategy (password vs. URL-fragment key) before consuming.

#### `DELETE /api/v3/notes/{id}` — view / consume

**Response** (msgpack): `{ meta: { expiration?, views?, extra? }, data: bytes }`

Returns the full envelope. Client decrypts `data` using key derived from `meta.extra` (if present) or URL fragment, then decodes the inner msgpack to get text/files.

#### `GET /api/v3/status` — server config

**Response** (JSON, not msgpack): server configuration, not note data. Kept as JSON for simplicity.

### Valkey hash field layout

```
Key:   {CACHE_PREFIX}{id}
Fields:
  views       (i32)       # remaining views, or absent
  expiration  (u32)       # unix timestamp, or absent
  extra       (bytes)     # client-opaque, size-limited
  data        (bytes)     # encrypted msgpack blob
```

`get_meta(id)` does `HMGET views expiration extra` — never touches `data`.

---

## 8. Implementation order

1. Shared package scaffolding (package.json, tsconfig, vitest config)
2. `crypto.ts` + tests
3. `compression.ts` + tests
4. `types.ts`
5. Backend: config rename + store rewrite + remove lock.rs
6. Backend: note routes rewrite (msgpack)
7. `api.ts` in shared (client) + tests
8. CLI rewrite (drop shared/, use @cryptgeon/shared)
9. Frontend migration
10. Infra/docs cleanup (cache rename, compose, Dockerfile)
11. Integration tests (playwright)
