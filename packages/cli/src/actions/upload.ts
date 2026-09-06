import { readFile } from 'node:fs/promises'
import { basename } from 'node:path'

import { encode } from '@msgpack/msgpack'
import mime from 'mime'
import { encrypt, generateKey, deriveKey, randomBytes, getServer, create, compress } from '@cryptgeon/shared'

export type UploadOptions = { views?: number; expiration?: number; password?: string }

export async function upload(input: string | string[], options: UploadOptions): Promise<string> {
  const { password, ...noteOptions } = options

  let key: Uint8Array
  let extra = new Uint8Array()
  if (password) {
    const salt = randomBytes(16)
    key = deriveKey(password, salt)
    extra = encode({ salt, N: 32768, r: 8, p: 1 })
  } else {
    key = generateKey()
  }

  let inner: Uint8Array
  if (typeof input === 'string') {
    inner = encode({ type: 'text', data: input })
  } else {
    const files = await Promise.all(
      input.map(async (path) => {
        const data = new Uint8Array(await readFile(path))
        const extension = path.substring(path.indexOf('.') + 1)
        const type = mime.getType(extension) ?? 'application/octet-stream'
        return { name: basename(path), mime: type, size: data.length, data }
      })
    )
    inner = encode({ type: 'files', data: files })
  }

  const data = encrypt(compress(inner), key)
  const result = await create({ meta: { ...noteOptions, extra }, data })
  let url = `${getServer()}/note/${result.id}`
  if (!password) url += `#${Buffer.from(key).toString('hex')}`
  return url
}