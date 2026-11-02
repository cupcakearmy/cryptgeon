# Contributing

## Requirements

- [mise](https://mise.jdx.dev) — manages pnpm, rust, node (see `mise.toml`)
- docker or [colima](https://github.com/abiosoft/colima) (for redis)

## Setup

```bash
mise install
pnpm install
```

## Development

```bash
pnpm run dev
```

Make sure docker/colima is running. This starts redis, the rust backend, the web client, and the CLI. The app is at [localhost:3000](http://localhost:3000).

## Tests

End-to-end tests with Playwright.

```sh
pnpm run test:prepare
pnpm run test:local
```

## Release

1. Update version across packages:

   ```sh
   ./version.mjs <semver>
   ```

2. Create and push the tag:

   ```sh
   git tag v<semver>
   git push --tags
   ```

The CI workflow publishes the CLI to npm and the Docker image to Docker Hub automatically.
