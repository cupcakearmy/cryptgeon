# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] — v3 (major rewrite)

### Added

- New shared TypeScript package `@cryptgeon/shared` as single source of truth for crypto, content codec and API client (crypto + compression + payload + types).
- Shared payload codec: `packContent` / `unpackContent` (encode → LZ4 → XChaCha20-Poly1305 and reverse).
- New `pg`-backend storage of note hashes in the cache.

### Changed

- Encryption from AES to **XChaCha20-Poly1305** (client-side); dropped `occulto`.
- All API bodies switched to **MessagePack**.
- Frontend migrated to SvelteKit + `@cryptgeon/shared`.
- CLI rebuilt with `vite-plus` (bundles all deps) and imports from `@cryptgeon/shared`.

### Breaking changes

- Endpoints moved to `/api/v3/notes/` and `/api/v3/status`; health check to `/healthz`.
- `meta.extra` holds client-opaque data (e.g. scrypt derivation params), size-limited (`EXTRA_SIZE_LIMIT`, default 512 bytes).
- Inner payload is msgpack: `{ type: "text", data }` or `{ type: "files", data: [{ name, mime, size, data }] }`.
- Env renames: `REDIS` → `CACHE`, `REDIS_PREFIX` → `CACHE_PREFIX`; new `EXTRA_SIZE_LIMIT`.
- Docker `redis` service → `cache`; healthcheck → `http://127.0.0.1:8000/healthz`; image stays `valkey/valkey:7-alpine` (swap for any RESP-compatible).
- Storage switched to cache hashes with atomic `HINCRBY` view counting; the per-note lock (`lock.rs`) is removed.
- Notes can have **both** `views` and `expiration` set simultaneously.
- v2 notes are **not migrated**: flush the cache before deploying v3; v2/v3 notes are not interoperable.

## [2.9.3] - 2026-06-25

### Added

- Basic file drag-and-drop support.

### Changed

- Publish to GitHub Container Registry instead of DockerHub.

### Fixed

- #207: keep audio/other file mime types intact.
- Localization key typo `note_to_big` → `note_too_big`.

## [2.9.2] - 2026-06-07

### Added

- Image paste support.
- Czech translation.
- `THEME_HOME_LINK` environment variable.
- Docker compose: prevent anonymous volume creation.

### Changed

- Replace Redis with Valkey in docker-compose files.
- Rust 2024 edition compat, watchexec and axum 0.8 updates.
- Switched license checker package.
- Frontend cleanup and readme/docs cleanup.

### Security

- Updated dependencies (ring, npm_and_yarn group).

## [2.9.1] - 2025-02-27

### Added

- Docs about running Redis in RAM-only mode.

### Fixed

- Password eye toggle not working.

### Security

- Updated dependencies.

## [2.9.0] - 2025-01-18

### Changed

- Frontend rework: migrate to Svelte 5.
- Update Redis documentation link in compose.

### Fixed

- Fix race condition on the delete endpoint by introducing locks to guarantee the view counter.

## [2.8.4] - 2025-01-02

### Added

- Chinese (zh-TW) translations.
- Basic auth example (nginx).

## [2.8.3] - 2024-09-27

### Added

- Options to add an imprint: `IMPRINT_URL`, `IMPRINT_HTML`.

## [2.8.2] - 2024-09-20

### Added

- Raycast extension links.

### Changed

- Add `type="button"` to form elements.
- Bump pnpm version.

## [2.8.1] - 2024-09-02

### Changed

- Move shared package into the CLI.
- Add a guide.

## [2.8.0] - 2024-08-27

### Changed

- Migrate backend from actix to axum (major refactor).
- More robust config, body limit via axum.
- Use container for test pipeline; skip size/expiration quirks in Safari.

### Fixed

- Typos in English localization.

## [2.7.0] - 2024-08-23

### Added

- Better programmatic access to the shared client.
- Redis TLS feature, dynamically-linked and native musl targets.
- French blog post and improved French translations.

### Changed

- Bump redis crate to 0.25.2.

## [2.6.1] - 2024-05-04

### Added

- Polish translation.

## [2.6.0] - 2024-03-24

### Added

- `ALLOW_FILES` flag.
- `NEW_NOTE_NOTICE` → `THEME_NEW_NOTE_NOTICE` theme flag.
- French translation update.

### Changed

- Reset form when clicking the logo after creating a note.

## [2.5.1] - 2024-03-04

### Changed

- Reset translation.
- German (`de`) translation update.

## [2.5.0] - 2024-03-04

### Added

- Expose internal shared functionality for external/programmatic usage.
- German translation updates.

### Security

- Updated dependencies (zerocopy).

## [2.4.0] - 2023-11-01

### Changed

- Removed HTML sanitation, display the original message as string
- Links are now displayed under the note in a separate section

## [2.3.3] - 2023-08-15

### Changed

- Maintenance.
- Updated dependencies.

## [2.3.2] - 2023-08-04

### Added

- Spanish readme (`README_ES.md`).

### Changed

- Translation and grammar fixes (en, de, de, es).

## [2.3.1] - 2023-06-23

### Added

- #92: Endpoint (`/api/live/`) for checking health status.

## [2.3.0] - 2023-05-30

### Added

- New CLI 🎉.
- Russian language.
- Option for reducing note id size (`ID_LENGTH`).

### Changed

- Moved to monorepo.

## [2.2.0] - 2023-01-14

### Changed

- Default port is now 8000, not 5000.
- Moved to generic encryption library `occulto`.

### Fixed

- Bad chinese language code.

### Security

- Updated dependencies.

## [2.1.0] - 2023-01-04

### Added

- QR Code to more easily copy and share links.

## [2.0.7] - 2022-12-26

### Changed

- Svelte Kit now stable 🎉

## [2.0.6] - 2022-11-12

### Fixed

- #66 Set minimum a view.

### Security

- Updated dependencies.

## [2.0.5] - 2022-11-04

### Fixed

- Docker build pipeline.

## [2.0.4] - 2022-10-29

### Added

- `THEME_PAGE_TITLE`.
- `THEME_FAVICON`.

## [2.0.3] - 2022-10-07

### Added

- Flag for verbosity.

### Fixed

- #58 Fixed bug in the max views frontend form.

## [2.0.2] - 2022-07-20

### Added

- Toasts for events.
- E2E Tests.
- Make backend more configurable.

## [2.0.1] - 2022-07-18

### Added

- Max file size on the client now.
- Loading information.

### Changed

- Changed encoding from hex to base64.
- Chinese language code.
- Notable speed improvements for big files.

## [2.0.0] - 2022-07-16

### Added

- Theming for logo and description text.

### Changed

- Moved to redis.
- New html sanitizing library.

## [2.0.0-rc.0] - 2022-07-15

### Added

- Theming for logo and description text.

### Changed

- Moved to redis.
- New html sanitizing library.

## [1.5.3] - 2022-06-07

### Changed

- Use the value from the `MEMCACHE` env variable in startup script.

## [1.5.2] - 2022-06-07

### Added

- Wait for script for memecached.

### Security

- Updated dependencies.

## [1.5.1] - 2022-05-15

### Fixed

- Remove double note content.

## [1.5.0] - 2022-05-14

### Added

- Links in notes are not highlighted and can be directly clicked #30.

## [1.4.1] - 2022-03-05

### Fixed

- Router in prod build.

## [1.4.0] - 2022-03-02

### Added

- Support for multiple languages.
- Select multiple files without removing already selected ones.
- Tooltip for copy action.
- Configure maximum views, expiration and advanced options for the server.

### Changed

- Use native SVGs instead of images.
- Update robots.txt file to allow only root.
- Stronger frontend types.

## [1.3.3] - 2022-01-03

### Fixed

- Bug fix due to dependency update.

## [1.3.2] - 2022-01-02

### Changed

- Dependencies updates.
- Folder structure.

## [1.3.1] - 2021-12-30

### Added

- Short explanation in the home page.

### Changed

- Explanation in about & readme.
- Shorten server ids from 512 to 256bit.

## [1.3.0] - 2021-12-22

### Added

- Option to set a custom size limit.
- Options to share files.

### Changed

- Don't delete note if time is not expired yet
- Use pnpm instead of npm.

## [1.2.0] - 2021-11-11

### Changed

- Switch to pnpm.

### Security

- Dependencies updated.

## [1.1.1] - 2021-05-17

### Fixed

- Height on big displays.
- About page.

## [1.1.0] - 2021-05-16

### Security

- Using hash `#` instead of path.

## [1.0.11] - 2021-05-08

### Added

- loading text.
- description for created notes about availability.

### Changed

- iterations from 100 to 100k.

### Fixed

- time based view bug.

## [1.0.10] - 2021-05-08

### Fixed

- API endpoint was not reachable.

## [1.0.9] - 2021-05-07

## Changed

- Removed a dependency.

## [1.0.8] - 2021-05-05

### Added

- Manual theme override option.

### Fixed

- Removed Arm builds for now.
- iOS style bugs.

## [1.0.7] - 2021-05-04

### Added

- Arm images.

## [1.0.6] - 2021-05-04

### Added

- Always use encryption with random passwords included links.

## [1.0.5] - 2021-05-03

### Fixed

- Typos.

## [1.0.4] - 2021-05-02

### Added

- From scratch docker image.

## [1.0.3] - 2021-05-02

### Fixed

- Higher default text area.
- Mobile touchups.

## [1.0.2] - 2021-05-02

### Fixed

- SVG Icons.

## [1.0.1] - 2021-05-02

### Added

- Dark mode support.

### Fixed

- Don't reload data on wrong password.

## [1.0.0] - 2021-05-02

Initial release.
