import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { getFileChecksum } from '../../files'
import { checkLinkForDownload } from '../../utils'

const IMG_PATH = 'test/assets/image.jpg'

test.describe('@web', () => {
  test('paste image', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'DataTransfer.items.add(File) is only supported in Chromium')
    const checksum = await getFileChecksum(IMG_PATH)
    const imgBuffer = await readFile(IMG_PATH)
    const imgBase64 = imgBuffer.toString('base64')

    await page.goto('/')
    await page.waitForSelector('form')

    // Create a paste event with clipboardData containing the image file
    await page.evaluate(
      async ({ base64, mimeType }) => {
        const response = await fetch(`data:${mimeType};base64,${base64}`)
        const blob = await response.blob()
        const file = new File([blob], 'image.jpg', { type: mimeType })

        const dt = new DataTransfer()
        dt.items.add(file)

        const event = new ClipboardEvent('paste', {
          bubbles: true,
          cancelable: true,
          clipboardData: dt,
        })

        document.querySelector('form')?.dispatchEvent(event)
      },
      { base64: imgBase64, mimeType: 'image/jpeg' },
    )

    // Wait for the paste to process and preview to appear
    await expect(page.locator('.pasted-images-preview')).toBeVisible({ timeout: 5000 })

    // Create the note
    await page.locator('button:has-text("create")').click()
    const link = await page.getByTestId('share-link').inputValue()

    // Navigate to the note and reveal it
    await page.goto('/')
    await page.goto(link)
    await page.getByTestId('show-note-button').click()

    // Verify image preview is visible
    await expect(page.locator('img.preview')).toBeVisible({ timeout: 5000 })

    // Download and verify checksum
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('[data-testid="result"] button').first().click(),
    ])
    const path = await download.path()
    if (!path) throw new Error('Download failed')
    const cs = await getFileChecksum(path)
    expect(cs).toBe(checksum)
  })
})
