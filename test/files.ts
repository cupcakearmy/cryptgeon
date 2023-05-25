import { createHash } from 'crypto'
import { cp as cpFN, rm as rmFN } from 'fs'
import { readFile } from 'fs/promises'
import { promisify } from 'util'

export const cp = promisify(cpFN)
export const rm = promisify(rmFN)

export const Files = {
  PDF: 'test/assets/AES.pdf',
  Image: 'test/assets/image.jpg',
  Zip: 'test/assets/Pigeons.zip',
}

export async function getFileChecksum(file: string) {
  const buffer = await readFile(file)
  const hash = createHash('sha3-256').update(buffer).digest('hex')
  return hash
}

export async function tmpFile(file: string) {
  const name = `./tmp/${Math.random().toString(36).substring(7)}`
  await cp(file, name)
  return name
}
