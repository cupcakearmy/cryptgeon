import { test } from '@playwright/test'
import { checkLinkDoesNotExist, checkLinkForText, createNoteSuccessfully } from '../../utils'

test.describe('@web', () => {
  test('only shown once', async ({ page }) => {
    const text = `Christian victorious reason suicide dead. Right ultimate gains god hope truth burying selfish society joy. Ultimate.`
    const link = await createNoteSuccessfully(page, { text })
    await checkLinkForText(page, { link, text })
    await checkLinkDoesNotExist(page, link)
  })

  test('view 3 times', async ({ page }) => {
    const text = `Justice holiest overcome fearful strong ultimate holiest christianity.`
    const link = await createNoteSuccessfully(page, { text, views: 3 })
    await checkLinkForText(page, { link, text })
    await checkLinkForText(page, { link, text })
    await checkLinkForText(page, { link, text })
    await checkLinkDoesNotExist(page, link)
  })
})
