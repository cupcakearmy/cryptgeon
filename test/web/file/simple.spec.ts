import { test } from '@playwright/test'
import { checkLinkDoesNotExist, checkLinkForDownload, checkLinkForText, createNote, getFileChecksum } from '../../utils'
import Files from './files'

test.describe('@web', () => {
  test('simple pdf', async ({ page }) => {
    const files = [Files.PDF]
    const link = await createNote(page, { files })
    await checkLinkForText(page, link, 'AES.pdf')
    await checkLinkDoesNotExist(page, link)
  })

  test('pdf content', async ({ page }) => {
    const files = [Files.PDF]
    const checksum = await getFileChecksum(files[0])
    const link = await createNote(page, { files })
    await checkLinkForDownload(page, link, 'AES.pdf', checksum)
  })

  test('image content', async ({ page }) => {
    const files = [Files.Image]
    const checksum = await getFileChecksum(files[0])
    const link = await createNote(page, { files })
    await checkLinkForDownload(page, link, 'image.jpg', checksum)
  })
})
