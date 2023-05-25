import { test } from '@playwright/test'
import { CLI, checkLinkForDownload, checkLinkForText, createNote, getLinkFromCLI } from '../../utils'
import { Files, getFileChecksum, rm, tmpFile } from '../../files'
import { basename } from 'path'

const text = `Endless prejudice endless play derive joy eternal-return selfish burying. Of decieve play pinnacle faith disgust. Spirit reason salvation burying strong of joy ascetic selfish against merciful sea truth. Ubermensch moral prejudice derive chaos mountains ubermensch justice philosophy justice ultimate joy ultimate transvaluation. Virtues convictions war ascetic eternal-return spirit. Ubermensch transvaluation noble revaluation sexuality intentions salvation endless decrepit hope noble fearful. Justice ideal ultimate snare god joy evil sexuality insofar gains oneself ideal.`
const password = 'password'

test.describe('text @cross', () => {
  test('cli to web', async ({ page }) => {
    const file = await tmpFile(Files.Image)
    const checksum = await getFileChecksum(file)
    const note = await CLI('send', 'file', file)
    const link = getLinkFromCLI(note.stdout)
    await rm(file)

    await checkLinkForDownload(page, { link, text: basename(file), checksum })
  })

  test('cli to web with password', async ({ page }) => {
    const file = await tmpFile(Files.Image)
    const checksum = await getFileChecksum(file)
    const note = await CLI('send', 'file', file, '--password', password)
    const link = getLinkFromCLI(note.stdout)
    await rm(file)

    await checkLinkForDownload(page, { link, text: basename(file), checksum, password })
  })

  test('web to cli', async ({ page }) => {
    const files = [Files.Image]
    const checksum = await getFileChecksum(files[0])
    const link = await createNote(page, { files })

    const filename = basename(files[0])
    await CLI('open', link, '--all')
    const c = await getFileChecksum(filename)
    await rm(basename(filename))
    test.expect(checksum).toBe(c)
  })

  test('web to cli with password', async ({ page }) => {
    const files = [Files.Image]
    const checksum = await getFileChecksum(files[0])
    const link = await createNote(page, { files, password })

    const filename = basename(files[0])
    await CLI('open', link, '--all', '--password', password)
    const c = await getFileChecksum(filename)
    await rm(basename(filename))
    test.expect(checksum).toBe(c)
  })
})
