import { describe, expect, it, vi } from 'vitest'
import { encode, decode } from '@msgpack/msgpack'
import { setServer, getServer, create, info, get, status } from './api'

const server = 'http://example.test'
const created = encode({ id: 'abc123' })
const metaOut = encode({ meta: { views: 3, extra: Buffer.from('040506','hex') } })
const dataOut = encode({ meta: { views: 0 },data: Buffer.from('090909','hex') })

function mockFetch(body: Uint8Array) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    arrayBuffer: async () => body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength),
    json: async () => ({}),
  })
}

function copyBuffer(buf: Uint8Array) {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
}

describe('api client', () => {
  it('setServer trims trailing slashes', () => {
    setServer('http://x.test///')
    expect(getServer()).toBe('http://x.test')
  })

  it('create POSTs msgpack note and returns id', async () => {
    setServer(server)
    const fetchMock = mockFetch(created)
    vi.stubGlobal('fetch', fetchMock)
    const note = { meta: { views: 5 },data: Buffer.from('010203','hex') }
    const result = await create(note)
    const url = fetchMock.mock.calls[0]![0]!
    const init = fetchMock.mock.calls[0]![1]!
    expect(url).toBe(server + '/api/v3/notes')
    expect(init.method).toBe('POST')
    expect(init.headers).toEqual({ 'content-type': 'application/msgpack' })
    const sent = decode(new Uint8Array(copyBuffer(init.body))) as { meta?: { views?: number } }
    expect(sent?.meta?.views).toBe(5)
    expect(result).toEqual({ id: 'abc123' })
    vi.unstubAllGlobals()
  })

 it('info GETs meta', async () => {
    setServer(server)
    const fetchMock = mockFetch(metaOut)
    vi.stubGlobal('fetch', fetchMock)
    const result = await info('id1')
    expect(result?.views).toBe(3)
    vi.unstubAllGlobals()
  })

 it('get DELETEs and parses data', async () => {
    setServer(server)
    const fetchMock = mockFetch(dataOut)
    vi.stubGlobal('fetch', fetchMock)
    const result = await get('id2')
    expect(result?.meta?.views).toBe(0)
    const init = fetchMock.mock.calls[0]![1]!
    expect(init.method).toBe('DELETE')
    vi.unstubAllGlobals()
  })

 it('status GETs JSON config', async () => {
    setServer(server)
    const fetchMock = mockFetch(new Uint8Array())
    vi.stubGlobal('fetch', fetchMock)
    await status()
    const url = fetchMock.mock.calls[0]![0]!
    expect(url).toBe(server + '/api/v3/status')
    vi.unstubAllGlobals()
  })
})
