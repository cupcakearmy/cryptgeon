import { readFile } from 'node:fs/promises'
import { basename } from 'node:path'

import mime from 'mime'
import { getServer, create, packContent, type FileDTO } from '@cryptgeon/shared'

export type UploadOptions = { views?: number; expiration?: number; password?: string }

export async function upload(input: string | string[], options: UploadOptions): Promise<string> {
  const { password, ...noteOptions } = options

  const payload = packContent(
    typeof input === 'string'
      ? { type: 'text', text: input }
      : { type: 'files', files: await fileDTOSfromPaths(input) },
    password
  )

  const result = await create({ meta: { ...noteOptions, extra: payload.extra }, data: payload.data })
  let url = `${getServer()}/note/${result.id}`
  if (!password) url += `#${Buffer.from(payload.key).toString('hex')}`
  return url
}

async function fileDTOSfromPaths(paths: string[]): Promise<FileDTO[]> {
  return Promise.all(
    paths.map(async (path) => {
      const extension = path.substring(path.indexOf('.') + 1)
      const data = new Uint8Array(await readFile(path))
      return {
        name: basename(path),
        mime: mime.getType(extension) ?? 'application/octet-stream',
        size: data.length,
        data,
      }
    })
  )
}