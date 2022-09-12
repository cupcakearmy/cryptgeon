<p align="center">
  <img src="./design/Github_zh-CN.png" alt="logo">
</p>

<a href="https://discord.gg/nuby6RnxZt">
  <img alt="discord" src="https://img.shields.io/discord/252403122348097536?style=for-the-badge" />
  <img alt="docker pulls" src="https://img.shields.io/docker/pulls/cupcakearmy/cryptgeon?style=for-the-badge" />
  <img alt="Docker image size badge" src="https://img.shields.io/docker/image-size/cupcakearmy/cryptgeon?style=for-the-badge" />
  <img alt="Latest version" src="https://img.shields.io/github/v/release/cupcakearmy/cryptgeon?style=for-the-badge" />
</a>

<br/>
<a href="https://www.producthunt.com/posts/cryptgeon?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-cryptgeon" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=295189&theme=light" alt="Cryptgeon - Securely share self-destructing notes | Product Hunt" height="50" /></a>
<a href=""><img src="./.github/lokalise.png" height="50">
<br/>

[EN](README.md) | 简体中文

## 关于本项目

_加密鸽_ 是一个受 [_PrivNote_](https://privnote.com)项目启发的安全、开源共享密信和文件共享服务器

> 🌍 如果你想翻译此项目请随时与我联系.
>
> 感谢 [Lokalise](https://lokalise.com/) 提供免费的平台服务支持

## 演示示例

查看加密鸽的在线演示 demo： [cryptgeon.org](https://cryptgeon.org)

## 功能

- 服务端无法解密和查看客户端加密的内容
- 查看次数或时间限制，阅后即焚
- 您发送的数据将存放于内存中，不会写入到磁盘中
- 黑暗模式支持

## 加密鸽是如何工作的？

加密鸽会为每条笔记都生成一个独立的 <code>id (256bit)</code> 和 <code>key 256(bit)</code>。

其中<code>id</code>用于保存和提取密信， 在这之后这封密信将会被客户端使用 AES 算法的 GCM 模式和`key`进行加密然后发送至服务器，数据将会保存在服务器的内存中且永远不会被持久化到硬盘上，服务端永远不会得到密钥并且无法解读密信的内容。

## 屏幕截图

![screenshot](./design/Screens.png)

## 环境变量

| 变量名称           | 默认值            | 描述                                                                               |
| ----------------- | ---------------- | --------------------------------------------------------------------------------- |
| `REDIS`           | `redis://redis/` | Redis 连接 URL。                                                                   |
| `SIZE_LIMIT`      | `1 KiB`          | 最大请求体(body)限制。有关支持的数值请查看 [字节单位](https://docs.rs/byte-unit/)        |
| `MAX_VIEWS`       | `100`            | 密信最多查看次数限制                                                                 |
| ` MAX_EXPIRATION` | `360`            | 密信最长过期时间限制(分钟)                                                            |
| `ALLOW_ADVANCED`  | `true`           | 是否允许自定义设置，该项如果设为`false`，则不会显示自定义设置模块                           |
| `THEME_IMAGE`     | `""`             | 自定义Logo图片，你在这里填写的的图片链接必须是可以公开访问的。                              | 
| `THEME_TEXT`      | `""`             | 自定义在Logo下方的文本。                                                              |

## 部署

ℹ️ 加密鸽必须使用`https`，否则浏览器可能将不会支援加密鸽的加密算法。

### Docker

Docker 是最简单的部署方式。这里是[官方镜像的地址](https://hub.docker.com/r/cupcakearmy/cryptgeon)。

附：译者的[部署笔记](https://www.hash070.top/archives/cryptgeon-docker-deploy.html)

```yaml
# docker-compose.yml
version: '3.8'

services:
  redis:
    image: redis:7-alpine

  app:
    image: cupcakearmy/cryptgeon:latest
    depends_on:
      - redis
    environment:
      SIZE_LIMIT: 4 MiB
    ports:
      - 80:5000
```

### NGINX 反向代理

查看 [examples/nginx](https://github.com/cupcakearmy/cryptgeon/tree/main/examples/nginx) 目录。那里有几个示例反代配置文件模板，其中一个是带 https 配置的反代配置模板，你需要指定服务器的名称和证书才能生效。

### Traefik 2

假设:

- 外部 Docker 代理网络 `proxy`
- 证书解析器 `le`
- 一个 https 入站点 `secure`
- 域名 `example.org`

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

## 开发

**环境要求**

- `pnpm`: `>=6`
- `node`: `>=14`
- `rust`: edition `2021`

**安装**

```bash
pnpm install
pnpm --prefix frontend install

# 你还需要安装CargoWatch.
# https://lib.rs/crates/cargo-watch
cargo install cargo-watch
```

**运行**

确保你的 Docker 正在运行

> 如果你用的是 `macOS` 的话你可能需要关闭AirPlay接收功能因为该功能需要占用5000端口...)
> https://developer.apple.com/forums/thread/682332

```bash
pnpm run dev
```

在根目录执行 `pnpm run dev` 会开启下列服务:

- 一个 redis docker 容器
- 无热重载的 rust 后端
- 可热重载的客户端

你可以通过 1234 端口进入该应用，即 [localhost:1234](http://localhost:1234).

## 测试

这些测试是用Playwright实现的一些端到端测试用例。

```sh
pnpm run ci:prepare
docker compose up redis -d
pnpm run ci:server

# 在另一个终端中：
# 使用test或者test:local script。为了更快的开发，本地版本只会在一个浏览器中运行。
pnpm run test:local
```

###### Attributions

- 测试数据:
  - 测试文本 [Nietzsche Ipsum](https://nietzsche-ipsum.com/)
  - [AES Paper](https://www.cs.miami.edu/home/burt/learning/Csc688.012/rijndael/rijndael_doc_V2.pdf)
  - [Unsplash Pictures](https://unsplash.com/)
- 加载动画由 [Nikhil Krishnan](https://codepen.io/nikhil8krishnan/pen/rVoXJa) 提供
- 图标由来自 <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> 的 <a href="https://www.freepik.com" title="Freepik">freepik</a> 提供
