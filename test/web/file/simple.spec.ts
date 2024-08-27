import { test } from '@playwright/test'
import { Files, getFileChecksum } from '../../files'
import { checkLinkDoesNotExist, checkLinkForDownload, checkLinkForText, createNoteSuccessfully } from '../../utils'

test.describe('@web', () => {
  test('simple pdf', async ({ page }) => {
    const files = [Files.PDF]
    const link = await createNoteSuccessfully(page, { files })
    await checkLinkForText(page, { link, text: 'AES.pdf' })
    await checkLinkDoesNotExist(page, link)
  })

  test('pdf content', async ({ page }) => {
    const files = [Files.PDF]
    const checksum = await getFileChecksum(files[0])
    const link = await createNoteSuccessfully(page, { files })
    await checkLinkForDownload(page, { link, text: 'AES.pdf', checksum })
  })

  test('image content', async ({ page }) => {
    const files = [Files.Image]
    const checksum = await getFileChecksum(files[0])
    const link = await createNoteSuccessfully(page, { files })
    await checkLinkForDownload(page, { link, text: 'image.jpg', checksum })
  })

  test('simple pdf with password', async ({ page }) => {
    const files = [Files.PDF]
    const password = 'password'
    const link = await createNoteSuccessfully(page, { files, password })
    await checkLinkForText(page, { link, text: 'AES.pdf', password })
    await checkLinkDoesNotExist(page, link)
  })
})
