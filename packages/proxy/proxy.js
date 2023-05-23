import http from 'http'
import httpProxy from 'http-proxy'

const proxy = httpProxy.createProxyServer()
proxy.on('error', function (err, req, res) {
  console.error(err)
  res.writeHead(500, { 'Content-Type': 'text/plain' })
  res.end('500 Internal Server Error')
})

const server = http.createServer(function (req, res) {
  const target = req.url.startsWith('/api/') ? 'http://127.0.0.1:8000' : 'http://localhost:8001'
  proxy.web(req, res, { target, proxyTimeout: 250, timeout: 250 })
})
server.listen(1234)
console.log('Proxy on http://localhost:1234')
