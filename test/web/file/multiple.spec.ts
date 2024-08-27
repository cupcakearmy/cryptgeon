import { test } from '@playwright/test'
import { Files, getFileChecksum } from '../../files'
import { checkLinkForDownload, createNoteSuccessfully } from '../../utils'

test.describe('@web', () => {
  test('multiple', async ({ page }) => {
    const files = [Files.PDF, Files.Image]
    const checksums = await Promise.all(files.map(getFileChecksum))
    const link = await createNoteSuccessfully(page, { files, views: 2 })
    await checkLinkForDownload(page, { link, text: 'image.jpg', checksum: checksums[1] })
    await checkLinkForDownload(page, { link, text: 'AES.pdf', checksum: checksums[0] })
  })
})
