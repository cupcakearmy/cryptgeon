import { Adapters, get, info, setBase } from '@cryptgeon/shared'
import inquirer from 'inquirer'
import { access, constants, writeFile } from 'node:fs/promises'
import { basename, resolve } from 'node:path'
import { Hex } from 'occulto'
import pretty from 'pretty-bytes'

import { exit } from './utils'

export async function download(url: URL) {
  setBase(url.origin)
  const id = url.pathname.split('/')[2]
  await info(id).catch(() => exit('Note does not exist or is expired'))
  const note = await get(id)

  const password = url.hash.slice(1)
  const key = Hex.decode(password)

  const couldNotDecrypt = () => exit('Could not decrypt note. Probably an invalid password')
  switch (note.meta.type) {
    case 'file':
      const files = await Adapters.Files.decrypt(note.contents, key).catch(couldNotDecrypt)
      if (!files) {
        exit('No files found in note')
        return
      }
      console.log(files)
      const { names } = await inquirer.prompt([
        {
          type: 'checkbox',
          message: 'What files should be saved?',
          name: 'names',
          choices: files.map((file) => ({
            value: file.name,
            name: `${file.name} - ${file.type} - ${pretty(file.size, { binary: true })}`,
            checked: true,
          })),
        },
      ])

      const selected = files.filter((file) => names.includes(file.name))

      if (!selected.length) exit('No files selected')

      await Promise.all(
        files.map(async (file) => {
          let filename = resolve(file.name)
          try {
            // If exists -> prepend timestamp to not overwrite the current file
            await access(filename, constants.R_OK)
            filename = resolve(`${Date.now()}-${file.name}`)
          } catch {}
          await writeFile(filename, new Uint8Array(await file.contents.arrayBuffer()))
          console.log(`Saved: ${basename(filename)}`)
        })
      )
      break
    case 'text':
      const plaintext = await Adapters.Text.decrypt(note.contents, key).catch(couldNotDecrypt)
      console.log(plaintext)
      break
  }
}
