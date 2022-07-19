import { test } from '@playwright/test'
import { checkLinkDoesNotExist, checkLinkForText, createNote } from '../utils'

test('only shown once', async ({ page }) => {
  const text = `Christian victorious reason suicide dead. Right ultimate gains god hope truth burying selfish society joy. Ultimate.`
  const shareLink = await createNote(page, { text })
  await checkLinkForText(page, shareLink, text)
  await checkLinkDoesNotExist(page, shareLink)
})

test('view 3 times', async ({ page }) => {
  const text = `Justice holiest overcome fearful strong ultimate holiest christianity.`
  const shareLink = await createNote(page, { text, views: 3 })
  await checkLinkForText(page, shareLink, text)
  await checkLinkForText(page, shareLink, text)
  await checkLinkForText(page, shareLink, text)
  await checkLinkDoesNotExist(page, shareLink)
})
