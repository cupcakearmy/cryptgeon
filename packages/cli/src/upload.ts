import { Blob } from 'node:buffer'
import { readFile, stat } from 'node:fs/promises'
import { basename } from 'node:path'

import { Adapters, BASE, create, FileDTO, Note } from '@cryptgeon/shared'
import * as mime from 'mime'
import { AES, Hex, TypedArray } from 'occulto'

import { exit } from './utils.js'

type UploadOptions = Pick<Note, 'views' | 'expiration'>

export async function upload(key: TypedArray, note: Note) {
  try {
    const result = await create(note)
    const password = Hex.encode(key)
    const url = `${BASE}/note/${result.id}#${password}`
    console.log(`Note created under:\n\n${url}`)
  } catch {
    exit('Could not create note')
  }
}

export async function uploadFiles(paths: string[], options: UploadOptions) {
  const key = await AES.generateKey()
  const files: FileDTO[] = await Promise.all(
    paths.map(async (path) => {
      const data = new Uint8Array(await readFile(path))
      const stats = await stat(path)
      const extension = path.substring(path.indexOf('.') + 1)
      const type = mime.getType(extension) ?? 'application/octet-stream'
      return {
        name: basename(path),
        size: stats.size,
        contents: data,
        type,
      } satisfies FileDTO
    })
  )

  const contents = await Adapters.Files.encrypt(files, key)
  await upload(key, { ...options, contents, meta: { type: 'file' } })
}

export async function uploadText(text: string, options: UploadOptions) {
  const key = await AES.generateKey()
  const contents = await Adapters.Text.encrypt(text, key)
  await upload(key, { ...options, contents, meta: { type: 'text' } })
}
