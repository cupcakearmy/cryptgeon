import { test } from '@playwright/test'
import { checkLinkDoesNotExist, checkLinkForText, createNote } from '../utils'

test('1 minute', async ({ page }) => {
  const text = `Virtues value ascetic revaluation sea dead strong burying.`
  const minutes = 1
  const timeout = minutes * 60_000
  test.setTimeout(timeout * 2)
  const shareLink = await createNote(page, { text, expiration: minutes })
  await checkLinkForText(page, shareLink, text)
  await checkLinkForText(page, shareLink, text)
  await page.waitForTimeout(timeout)
  await checkLinkDoesNotExist(page, shareLink)
})
