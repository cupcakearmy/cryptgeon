import { expect, test, type Page } from '@playwright/test'

async function createNote(page: Page, text: string): Promise<string> {
  await page.goto('/')
  await page.locator('textarea').click()
  await page.locator('textarea').fill(text)
  await page.locator('button:has-text("create")').click()

  await page.locator('[data-testid="share-link"]').click()
  const shareLink = await page.locator('[data-testid="share-link"]').inputValue()
  return shareLink
}

async function checkLinkForText(page: Page, link: string, text: string) {
  await page.goto(link)
  await page.locator('[data-testid="show-note-button"]').click()
  expect(await page.locator('[data-testid="result"] >> .note').innerText()).toBe(text)
}

async function checkLinkDoesNotExist(page: Page, link: string) {
  await page.goto(link)
  await expect(page.locator('main')).toContainText('note was not found or was already deleted')
}

test('simple', async ({ page }) => {
  const text = `Endless prejudice endless play derive joy eternal-return selfish burying. Of decieve play pinnacle faith disgust. Spirit reason salvation burying strong of joy ascetic selfish against merciful sea truth. Ubermensch moral prejudice derive chaos mountains ubermensch justice philosophy justice ultimate joy ultimate transvaluation. Virtues convictions war ascetic eternal-return spirit. Ubermensch transvaluation noble revaluation sexuality intentions salvation endless decrepit hope noble fearful. Justice ideal ultimate snare god joy evil sexuality insofar gains oneself ideal.`
  const shareLink = await createNote(page, text)
  await checkLinkForText(page, shareLink, text)
})

test('only shown once', async ({ page }) => {
  const text = `Christian victorious reason suicide dead. Right ultimate gains god hope truth burying selfish society joy. Ultimate.`
  const shareLink = await createNote(page, text)
  await checkLinkForText(page, shareLink, text)
  await checkLinkDoesNotExist(page, shareLink)
})
