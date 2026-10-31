import { access, constants, writeFile } from 'node:fs/promises'
import { basename, resolve, win32 } from 'node:path'

// Last path segment only. win32.basename also treats "\" as a separator.
export function safeDownloadName(name: string): string {
  if (typeof name !== 'string') throw new Error('Invalid file name')
  const base = win32.basename(basename(name))
  if (base === '' || base === '.' || base === '..') throw new Error('Invalid file name')
  return base
}

export async function saveDownloadedFile(name: string, data: Uint8Array, directory = process.cwd()) {
  const safe = safeDownloadName(name)
  let filename = resolve(directory, safe)
  try {
    await access(filename, constants.R_OK)
    filename = resolve(directory, `${Date.now()}-${safe}`)
  } catch {}
  await writeFile(filename, data)
  console.log(`Saved: ${basename(filename)}`)
  return filename
}
