<p align="center">
  <img src="./design/Github.png" alt="logo">
</p>

<a href="https://discord.gg/nuby6RnxZt">
  <img alt="discord" src="https://img.shields.io/discord/252403122348097536?style=for-the-badge" />
  <img alt="docker pulls" src="https://img.shields.io/docker/pulls/cupcakearmy/cryptgeon?style=for-the-badge" />
  <img alt="Docker image size badge" src="https://img.shields.io/docker/image-size/cupcakearmy/cryptgeon?style=for-the-badge" />
  <img alt="Latest version" src="https://img.shields.io/github/v/release/cupcakearmy/cryptgeon?style=for-the-badge" />
</a>

<br/><br/>
<a href="https://www.producthunt.com/posts/cryptgeon?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-cryptgeon" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=295189&theme=light" alt="Cryptgeon - Securely share self-destructing notes | Product Hunt" height="50" /></a>
<a href=""><img src="./.github/lokalise.png" height="50">
<br/><br/>

EN | [简体中文](README_zh-CN.md)

## About?

_cryptgeon_ is a secure, open source sharing note or file service inspired by [_PrivNote_](https://privnote.com)

> 🌍 If you want to translate the project feel free to reach out to me.
>
> Thanks to [Lokalise](https://lokalise.com/) for providing free access to their platform.

## Demo

Check out the demo and see for yourself [cryptgeon.org](https://cryptgeon.org)

## Features

- server cannot decrypt contents due to client side encryption
- view or time constraints
- in memory, no persistence
- obligatory dark mode support

## How does it work?

each note has a generated <code>id (256bit)</code> and <code>key 256(bit)</code>. The
<code>id</code>
is used to save & retrieve the note. the note is then encrypted with aes in gcm mode on the
client side with the <code>key</code> and then sent to the server. data is stored in memory and
never persisted to disk. the server never sees the encryption key and cannot decrypt the contents
of the notes even if it tried to.

## Screenshot

![screenshot](./design/Screens.png)

## Environment Variables

| Variable         | Default          | Description                                                                                                                                                                                                   |
| ---------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `REDIS`          | `redis://redis/` | Redis URL to connect to. [According to format](https://docs.rs/redis/latest/redis/#connection-parameters)                                                                                                     |
| `SIZE_LIMIT`     | `1 KiB`          | Max size for body. Accepted values according to [byte-unit](https://docs.rs/byte-unit/). <br> `512 MiB` is the maximum allowed. <br> The frontend will show that number including the ~35% encoding overhead. |
| `MAX_VIEWS`      | `100`            | Maximal number of views.                                                                                                                                                                                      |
| `MAX_EXPIRATION` | `360`            | Maximal expiration in minutes.                                                                                                                                                                                |
| `ALLOW_ADVANCED` | `true`           | Allow custom configuration. If set to `false` all notes will be one view only.                                                                                                                                |
| `THEME_IMAGE`    | `""`             | Custom image for replacing the logo. Must be publicly reachable                                                                                                                                               |
| `THEME_TEXT`     | `""`             | Custom text for replacing the description below the logo                                                                                                                                                      |
| `VERBOSITY`      | `warn`           | Verbosity level for the backend. [Possible values](https://docs.rs/env_logger/latest/env_logger/#enabling-logging) are: `error`, `warn`, `info`, `debug`, `trace`                                             |

## Deployment

ℹ️ `https` is required otherwise browsers will not support the cryptographic functions.

### Docker

Docker is the easiest way. There is the [official image here](https://hub.docker.com/r/cupcakearmy/cryptgeon).

```yaml
# docker-compose.yml

version: '3.8'

services:
  redis:
    image: redis:7-alpine
    # Set a size limit. See link below on how to customise.
    # https://redis.io/docs/manual/eviction/
    command: redis-server --maxmemory 1gb --maxmemory-policy allkeys-lru

  app:
    image: cupcakearmy/cryptgeon:latest
    depends_on:
      - redis
    environment:
      # Size limit for a single note.
      SIZE_LIMIT: 4 MiB
    ports:
      - 80:5000
```

### NGINX Proxy

See the [examples/nginx](https://github.com/cupcakearmy/cryptgeon/tree/main/examples/nginx) folder. There an example with a simple proxy, and one with https. You need to specify the server names and certificates.

### Traefik 2

See the [examples/traefik](https://github.com/cupcakearmy/cryptgeon/tree/main/examples/traefik) folder.

### Scratch

See the [examples/scratch](https://github.com/cupcakearmy/cryptgeon/tree/main/examples/scratch) folder. There you'll find a guide how to setup a server and install cryptgeon from scratch.

### Synology

There is a [guide](https://mariushosting.com/how-to-install-cryptgeon-on-your-synology-nas/) you can follow.

## Development

**Requirements**

- `pnpm`: `>=6`
- `node`: `>=16`
- `rust`: edition `2021`

**Install**

```bash
pnpm install
pnpm --prefix frontend install

# Also you need cargo watch if you don't already have it installed.
# https://lib.rs/crates/cargo-watch
cargo install cargo-watch
```

**Run**

Make sure you have docker running.

> If you are on `macOS` you might need to disable AirPlay Receiver as it uses port 5000 (So stupid...)
> https://developer.apple.com/forums/thread/682332

```bash
pnpm run dev
```

Running `pnpm run dev` in the root folder will start the following things:

- redis docker container
- rust backend
- client

You can see the app under [localhost:1234](http://localhost:1234).

## Tests

Tests are end to end tests written with Playwright.

```sh
pnpm run test:prepare
docker compose up redis -d
pnpm run test:server

# In another terminal.
# Use the test or test:local script. The local version only runs in one browser for quicker development.
pnpm run test:local
```

## Security

Please refer to the security section [here](./SECURITY.md).

###### Attributions

- Test data:
  - Text for tests [Nietzsche Ipsum](https://nietzsche-ipsum.com/)
  - [AES Paper](https://www.cs.miami.edu/home/burt/learning/Csc688.012/rijndael/rijndael_doc_V2.pdf)
  - [Unsplash Pictures](https://unsplash.com/)
- Loading animation by [Nikhil Krishnan](https://codepen.io/nikhil8krishnan/pen/rVoXJa)
- Icons made by <a href="https://www.freepik.com" title="Freepik">freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a>
