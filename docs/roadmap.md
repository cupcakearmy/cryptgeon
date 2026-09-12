# Roadmap

## v3.1 — Single-file payload (drop the text/file union)

> Follow-up iteration of the inner payload, parked as `v3.1` (not part of core v3).

Everything becomes a **file**. Text is just a `FileDTO` with `created: true`. The `{ type: "text" } | { type: "files" }` union is removed.

```
# Inner layer (encrypted, client-only)
{ files: [
  { name: string, mime: string, size: number, data: bytes, created?: boolean }
] }
```

- `FileDTO` gains `created?: boolean` (default `false`).
- `created: true` = the file was authored inline at compose time (e.g. an empty text file the user typed into). Purely a **client/UI hint** — rides inside the encrypted inner payload, the server never sees it.
- `created: true` files render as an **editable text editor**; the rest render as binary file cards (upload/download).
- Default composer state = one empty `created` text file the user edits. No `isFile` toggle.

### Impact by area

- **Server / wire protocol / `api.ts`**: unchanged. Still an opaque encrypted `data` blob in the outer msgpack envelope.
- **Shared codec**: `NoteContent` becomes `{ files: FileDTO[] }`; drop the union + `switch(type)` in `unpackContent`. `packContent(input: FileDTO[], password?)`. Breaking inner-msgpack schema → ok, pre-release.
- **Frontend (`Create.svelte` — biggest)**: one `files: FileDTO[]` model; default empty `created` text file; editor binds a string, encodes to bytes on submit; add real files via upload (`created:false`).
- **CLI**: `send text "x"` → `files:[{ name:'note.txt', mime:'text/plain', data:utf8, created:true }]`. `send file a b` → drop `type` union. `open`/download prints text files, saves the rest.
- **Tests**: `payload.test.ts` rewritten to `{ files:[...] }`; playwright `switch-file`/`text-field` composer specs collapse + rework.

### Watches

- text↔bytes round-trip in the editor (encoding, line-endings);
- `size` must be set from the *encoded* bytes (matches `SIZE_LIMIT` / preview) — recompute after text→bytes;
- pasted binary files keep `created:false`; only inline-authored text is `created:true`.

### Payload pipeline

```mermaid
flowchart TD
    subgraph WRITE["CLIENT — encode / compress / encrypt"]
        A[Text or Files] --> B{password?}
        B -->|yes| C1[deriveKey password+salt<br>extra=encode salt,N,r,p]
        B -->|no| C2[generateKey random 32B]
        C2 --> D[URL fragment hex key]
        C1 --> E
        D --> E
        A --> F[encode inner files]
        F -->|encode content| G[inner msgpack]
        G --> H[LZ4 compress]
        H --> I[XChaCha20 encrypt]
        I -->|data| J[POST msgpack meta+data]
        C1 -->|extra| J
    end

    subgraph SERVER["SERVER — agnostic"]
        J --> K{hash store: views, expiration, extra, data}
    end

    subgraph READ["CLIENT — read"]
        L[meta/extra from PREVIEW] --> M{extra present?}
        M -->|yes| N[deriveKey pw+salt]
        M -->|no| O[key from URL hex fragment]
        N --> P[DELETE get envelope data]
        O --> P
        P --> Q[XChaCha20 decrypt]
        Q --> R[LZ4 decompress]
        R --> S[msgpack decode files]
        S -->|created:true| T[edit / render text]
        S -->|created:false| U[save files]
    end
```