import { test } from '@playwright/test'
import { checkLinkForDownload, createNote, getFileChecksum } from '../utils'
import Files from './files'

test('multiple', async ({ page }) => {
  const files = [Files.PDF, Files.Image]
  const checksums = await Promise.all(files.map(getFileChecksum))
  const link = await createNote(page, { files, views: 2 })
  await checkLinkForDownload(page, link, 'image.jpg', checksums[1])
  await checkLinkForDownload(page, link, 'AES.pdf', checksums[0])
})
