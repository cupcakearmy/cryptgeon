import inquirer from 'inquirer'
import { access, constants, writeFile } from 'node:fs/promises'
import { basename, resolve } from 'node:path'
import { decode } from '@msgpack/msgpack'
import pretty from 'pretty-bytes'
import { decrypt, deriveKey, setServer, getServer, info, get } from '@cryptgeon/shared'

export async function download(url: URL, all: boolean, suggestedPassword?: string) {
  setServer(url.origin)
  const id = url.pathname.split('/')[2]
  const meta = await info(id)
  if (!meta) throw new Error('Note does not exist or is expired')

  let key: Uint8Array
  if (meta.extra && meta.extra.length > 0) {
    if (suggestedPassword) {
      const derivation = decode(meta.extra) as any
      key = deriveKey(suggestedPassword, new Uint8Array(derivation.salt))
    } else {
      const response = await inquirer.prompt([
        { type: 'password', message: 'Note password', name: 'password' },
      ])
      const derivation = decode(meta.extra) as any
      key = deriveKey(response.password, new Uint8Array(derivation.salt))
    }
  } else {
    const hex = url.hash.slice(1)
    key = new Uint8Array(Buffer.from(hex, 'hex'))
  }

  const note = await get(id)
  if (!note) throw new Error('Could not load note')

  const decrypted = decrypt(note.data, key)
  const content = decode(decrypted) as any

  switch (content.type) {
    case 'files':
      const files: { name: string; data: Uint8Array }[] = content.data
      let selected: typeof files
      if (all) {
        selected = files
      } else {
        const { names } = await inquirer.prompt([
          {
            type: 'checkbox',
            message: 'What files should be saved?',
            name: 'names',
            choices: files.map((f) => ({
              value: f.name,
              name: `${f.name} - ${pretty(f.data.length, { binary: true })}`,
              checked: true,
            })),
          },
        ])
        selected = files.filter((f) => names.includes(f.name))
      }
      if (!selected.length) throw new Error('No files selected')
      await Promise.all(
        selected.map(async (f) => {
          let filename = resolve(f.name)
          try {
            await access(filename, constants.R_OK)
            filename = resolve(`${Date.now()}-${f.name}`)
          } catch {}
          await writeFile(filename, f.data)
          console.log(`Saved: ${basename(filename)}`)
        })
      )
      break
    case 'text':
      console.log(content.data)
      break
    default:
      throw new Error('Unknown content type')
  }
}