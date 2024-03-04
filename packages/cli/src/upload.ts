import { readFile, stat } from 'node:fs/promises'
import { basename } from 'node:path'

import { Adapters, BASE, create, FileDTO, Note, NoteMeta } from '@cryptgeon/shared'
import mime from 'mime'
import { AES, Hex } from 'occulto'

export type UploadOptions = Pick<Note, 'views' | 'expiration'> & { password?: string }

export async function upload(input: string | string[], options: UploadOptions): Promise<string> {
  const { password, ...noteOptions } = options
  const derived = options.password ? await AES.derive(options.password) : undefined
  const key = derived ? derived[0] : await AES.generateKey()

  let contents: string
  let type: NoteMeta['type']
  if (typeof input === 'string') {
    contents = await Adapters.Text.encrypt(input, key)
    type = 'text'
  } else {
    const files: FileDTO[] = await Promise.all(
      input.map(async (path) => {
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
    contents = await Adapters.Files.encrypt(files, key)
    type = 'file'
  }

  // Create the actual note and upload it.
  const note: Note = { ...noteOptions, contents, meta: { type, derivation: derived?.[1] } }
  const result = await create(note)
  let url = `${BASE}/note/${result.id}`
  if (!derived) url += `#${Hex.encode(key)}`
  return url
}
