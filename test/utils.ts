import { expect, type Page } from '@playwright/test'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { getFileChecksum } from './files'

const exec = promisify(execFile)

type CreatePage = {
  views?: number
  expiration?: number
  error?: string
  password?: string
} & (
  | {
      text: string
    }
  | {
      files: string[]
    }
)
async function createNote(page: Page, options: CreatePage): Promise<void> {
  await page.goto('/')

  if ('text' in options) {
    await page.getByTestId('text-field').fill(options.text)
  } else if (options.files) {
    await page.getByTestId('switch-file').click()

    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.locator('text=No Files Selected').click(),
    ])
    await fileChooser.setFiles(options.files)
  }

  if (options.views || options.expiration || options.password) await page.getByTestId('switch-advanced').click()
  if (options.views) {
    await page.getByTestId('field-views').fill(options.views.toString())
  }
  if (options.expiration) {
    await page.getByTestId('switch-advanced-toggle').click()
    await page.getByTestId('field-expiration').fill(options.expiration.toString())
  }
  if (options.password) {
    await page.getByTestId('custom-password').click()
    await page.getByTestId('password').fill(options.password)
  }

  await page.locator('button:has-text("create")').click()
}

export async function createNoteSuccessfully(page: Page, options: CreatePage): Promise<string> {
  await createNote(page, options)
  return await page.getByTestId('share-link').inputValue()
}

export async function createNoteError(page: Page, options: CreatePage, error: string): Promise<void> {
  await createNote(page, options)
  await expect(page.locator('._toastContainer')).toContainText(error)
}

type CheckLinkBase = {
  link: string
  text: string
  password?: string
}

export async function checkLinkForDownload(page: Page, options: CheckLinkBase & { checksum: string }) {
  await page.goto('/')
  await page.goto(options.link)
  if (options.password) await page.getByTestId('show-note-password').fill(options.password)
  await page.getByTestId('show-note-button').click()

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId(`result`).locator(`text=${options.text}`).click(),
  ])
  const path = await download.path()
  if (!path) throw new Error('Download failed')
  const cs = await getFileChecksum(path)
  expect(cs).toBe(options.checksum)
}

export async function checkLinkForText(page: Page, options: CheckLinkBase) {
  await page.goto('/')
  await page.goto(options.link)
  if (options.password) await page.getByTestId('show-note-password').fill(options.password)
  await page.getByTestId('show-note-button').click()
  const text = await page.getByTestId('result').locator('.note').innerText()
  expect(text).toContain(options.text)
}

export async function checkLinkDoesNotExist(page: Page, link: string) {
  await page.goto('/') // Required due to firefox: https://github.com/microsoft/playwright/issues/15781
  await page.goto(link)
  await expect(page.locator('main')).toContainText('note was not found or was already deleted')
}

export async function CLI(...args: string[]) {
  return await exec('./packages/cli/dist/cli.cjs', args, {
    env: {
      ...process.env,
      CRYPTGEON_SERVER: 'http://localhost:3000',
    },
  })
}

export function getLinkFromCLI(output: string): string {
  const match = output.match(/(https?:\/\/[^\s]+)/)
  if (!match) throw new Error('No link found in CLI output')
  return match[0]
}
