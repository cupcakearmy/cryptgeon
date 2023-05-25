import { test } from '@playwright/test'
import { basename } from 'node:path'
import { Files, getFileChecksum, rm, tmpFile } from '../../files'
import { CLI, getLinkFromCLI } from '../../utils'

test.describe('file @cli', () => {
  test('simple', async ({ page }) => {
    const file = await tmpFile(Files.Image)
    const checksum = await getFileChecksum(file)
    const note = await CLI('send', 'file', file)
    const link = getLinkFromCLI(note.stdout)
    await rm(file)

    await CLI('open', link, '--all')
    const c = await getFileChecksum(basename(file))
    await rm(basename(file))
    test.expect(checksum).toBe(c)
  })

  test('simple with password', async ({ page }) => {
    const file = await tmpFile(Files.Image)
    const password = 'password'
    const checksum = await getFileChecksum(file)
    const note = await CLI('send', 'file', file, '--password', password)
    const link = getLinkFromCLI(note.stdout)
    await rm(file)

    await CLI('open', link, '--all', '--password', password)
    const c = await getFileChecksum(basename(file))
    await rm(basename(file))
    test.expect(checksum).toBe(c)
  })
})
