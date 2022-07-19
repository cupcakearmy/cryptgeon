import { test } from '@playwright/test'
import { checkLinkForText, createNote } from '../utils'

test('simple', async ({ page }) => {
  const text = `Endless prejudice endless play derive joy eternal-return selfish burying. Of decieve play pinnacle faith disgust. Spirit reason salvation burying strong of joy ascetic selfish against merciful sea truth. Ubermensch moral prejudice derive chaos mountains ubermensch justice philosophy justice ultimate joy ultimate transvaluation. Virtues convictions war ascetic eternal-return spirit. Ubermensch transvaluation noble revaluation sexuality intentions salvation endless decrepit hope noble fearful. Justice ideal ultimate snare god joy evil sexuality insofar gains oneself ideal.`
  const shareLink = await createNote(page, { text })
  await checkLinkForText(page, shareLink, text)
})
