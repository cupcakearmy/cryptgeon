import http from 'http'
import httpProxy from 'http-proxy'

function start() {
  try {
    const proxy = httpProxy.createProxyServer({})
    const server = http.createServer(function (req, res) {
      const target = req.url.startsWith('/api/') ? 'http://localhost:5000' : 'http://localhost:3000'
      proxy.web(req, res, { target })
    })
    server.listen(1234)

    server.on('error', () => start())
  } catch (e) {
    start()
  }
}

start()
