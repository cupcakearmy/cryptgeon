import { expect, type Page } from '@playwright/test'
import { createHash } from 'crypto'
import { readFile } from 'fs/promises'

type CreatePage = { text?: string; files?: string[]; views?: number; expiration?: number; error?: string }
export async function createNote(page: Page, options: CreatePage): Promise<string> {
  await page.goto('/')

  if (options.text) {
    await page.locator('[data-testid="text-field"]').fill(options.text)
  } else if (options.files) {
    await page.locator('[data-testid="switch-file"]').click()

    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.locator('text=No Files Selected').click(),
    ])
    await fileChooser.setFiles(options.files)
  }

  if (options.views) {
    await page.locator('[data-testid="switch-advanced"]').click()
    await page.locator('[data-testid="field-views"]').fill(options.views.toString())
  } else if (options.expiration) {
    await page.locator('[data-testid="switch-advanced"]').click()
    await page.locator('[data-testid="switch-advanced-toggle"]').click()
    await page.locator('[data-testid="field-expiration"]').fill(options.expiration.toString())
  }

  await page.locator('button:has-text("create")').click()

  if (options.error) {
    await expect(page.locator('.error-text')).toContainText(options.error, { timeout: 60_000 })
  }

  const shareLink = await page.locator('[data-testid="share-link"]').inputValue()
  return shareLink
}

export async function checkLinkForDownload(page: Page, link: string, text: string, checksum: string) {
  await page.goto('/')
  await page.goto(link)
  await page.locator('[data-testid="show-note-button"]').click()

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator(`[data-testid="result"] >> text=${text}`).click(),
  ])
  const path = await download.path()
  if (!path) throw new Error('Download failed')
  const cs = await getFileChecksum(path)
  await expect(cs).toBe(checksum)
}
export async function checkLinkForText(page: Page, link: string, text: string) {
  await page.goto('/')
  await page.goto(link)
  await page.locator('[data-testid="show-note-button"]').click()
  await expect(await page.locator('[data-testid="result"] >> .note').innerText()).toContain(text)
}

export async function checkLinkDoesNotExist(page: Page, link: string) {
  await page.goto('/') // Required due to firefox: https://github.com/microsoft/playwright/issues/15781
  await page.goto(link)
  await expect(page.locator('main')).toContainText('note was not found or was already deleted')
}

export async function getFileChecksum(file: string) {
  const buffer = await readFile(file)
  const hash = createHash('sha3-256').update(buffer).digest('hex')
  return hash
}
