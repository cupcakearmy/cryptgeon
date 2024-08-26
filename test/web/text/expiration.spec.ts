import { test } from '@playwright/test'
import { checkLinkDoesNotExist, checkLinkForText, createNoteSuccessfully } from '../../utils'

test.describe('@web', () => {
  test('1 minute', async ({ page }) => {
    const text = `Virtues value ascetic revaluation sea dead strong burying.`
    const minutes = 1
    const timeout = minutes * 60_000
    test.setTimeout(timeout * 2)
    const link = await createNoteSuccessfully(page, { text, expiration: minutes })
    await checkLinkForText(page, { link, text })
    await checkLinkForText(page, { link, text })
    await page.waitForTimeout(timeout)
    await checkLinkDoesNotExist(page, link)
  })
})
