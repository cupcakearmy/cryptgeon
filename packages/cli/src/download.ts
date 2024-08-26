import { Adapters, get, info, setOptions } from '@cryptgeon/shared'
import inquirer from 'inquirer'
import { access, constants, writeFile } from 'node:fs/promises'
import { basename, resolve } from 'node:path'
import { AES, Hex } from 'occulto'
import pretty from 'pretty-bytes'

export async function download(url: URL, all: boolean, suggestedPassword?: string) {
  setOptions({ server: url.origin })
  const id = url.pathname.split('/')[2]
  const preview = await info(id).catch(() => {
    throw new Error('Note does not exist or is expired')
  })

  // Password
  let password: string
  const derivation = preview?.meta.derivation
  if (derivation) {
    if (suggestedPassword) {
      password = suggestedPassword
    } else {
      const response = await inquirer.prompt([
        {
          type: 'password',
          message: 'Note password',
          name: 'password',
        },
      ])
      password = response.password
    }
  } else {
    password = url.hash.slice(1)
  }

  const key = derivation ? (await AES.derive(password, derivation))[0] : Hex.decode(password)
  const note = await get(id)

  const couldNotDecrypt = new Error('Could not decrypt note. Probably an invalid password')
  switch (note.meta.type) {
    case 'file':
      const files = await Adapters.Files.decrypt(note.contents, key).catch(() => {
        throw couldNotDecrypt
      })
      if (!files) {
        throw new Error('No files found in note')
      }

      let selected: typeof files
      if (all) {
        selected = files
      } else {
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
        selected = files.filter((file) => names.includes(file.name))
      }

      if (!selected.length) throw new Error('No files selected')
      await Promise.all(
        selected.map(async (file) => {
          let filename = resolve(file.name)
          try {
            // If exists -> prepend timestamp to not overwrite the current file
            await access(filename, constants.R_OK)
            filename = resolve(`${Date.now()}-${file.name}`)
          } catch {}
          await writeFile(filename, file.contents)
          console.log(`Saved: ${basename(filename)}`)
        })
      )

      break
    case 'text':
      const plaintext = await Adapters.Text.decrypt(note.contents, key).catch(() => {
        throw couldNotDecrypt
      })
      console.log(plaintext)
      break
  }
}
