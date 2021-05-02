<p align="center">
<img src="./design/github.svg">
</p>

![Docker pulls badge](https://img.shields.io/docker/pulls/cupcakearmy/cryptgeon)
![Docker image size badge](https://img.shields.io/docker/image-size/cupcakearmy/cryptgeon)
![Latest version](https://img.shields.io/github/v/release/cupcakearmy/cryptgeon)

## About?

_cryptgeon_ is an secure, open source sharing note service inspired by [_PrivNote_](https://privnote.com)

## Demo

Check out the demo and see for yourself https://cryptgeon.nicco.io.

## Features

- view and time constrains
- in memory, no persistence
- in browser encryption → server cannot decrypt contents
- obligatory dark mode support

## How does it work?

each note has a 512bit generated <i>id</i> that is used to retrieve the note. data is stored in memory and never persisted to disk.

## Screenshot

![screenshot](./design/screen.jpg)

## Deployment

Docker is the easiest way. There is the [official image here](https://hub.docker.com/r/cupcakearmy/cryptgeon).

```yaml
# docker-compose.yml

version: '3.7'

services:
  memcached:
    image: memcached:1-alpine
    entrypoint: memcached -m 128 # Limit to 128 MB Ram, customize at free will.

  app:
    image: cupcakearmy/cryptgeon:latest
    ports:
      - 80:5000
```

## Development

1. Clone
2. run `npm i` in the root and and client `client/` folders.
3. Run `npm run dev` to start development.

Running `npm run dev` in the root folder will start the following things

- a memcache docker container
- rust backend with hot reload
- client with hot reload

You can see the app under [localhost:3000](http://localhost:3000).

###### Attributions

Icons made by <a href="https://www.freepik.com" title="Freepik">freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a>
