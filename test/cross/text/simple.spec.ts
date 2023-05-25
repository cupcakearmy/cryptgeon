import { test } from '@playwright/test'
import { CLI, checkLinkForText, createNote, getLinkFromCLI } from '../../utils'

const text = `Endless prejudice endless play derive joy eternal-return selfish burying. Of decieve play pinnacle faith disgust. Spirit reason salvation burying strong of joy ascetic selfish against merciful sea truth. Ubermensch moral prejudice derive chaos mountains ubermensch justice philosophy justice ultimate joy ultimate transvaluation. Virtues convictions war ascetic eternal-return spirit. Ubermensch transvaluation noble revaluation sexuality intentions salvation endless decrepit hope noble fearful. Justice ideal ultimate snare god joy evil sexuality insofar gains oneself ideal.`
const password = 'password'

test.describe('text @cross', () => {
  test('cli to web', async ({ page }) => {
    const note = await CLI('send', 'text', text)
    const link = getLinkFromCLI(note.stdout)

    await checkLinkForText(page, { link, text })
  })

  test('web to cli', async ({ page }) => {
    const link = await createNote(page, { text })
    const retrieved = await CLI('open', link)
    test.expect(retrieved.stdout.trim()).toBe(text)
  })

  test('cli to web with password', async ({ page }) => {
    const note = await CLI('send', 'text', text, '--password', password)
    const link = getLinkFromCLI(note.stdout)
    await checkLinkForText(page, { link, text, password })
  })

  test('web to cli with password', async ({ page }) => {
    const link = await createNote(page, { text, password })
    const retrieved = await CLI('open', link, '--password', password)
    test.expect(retrieved.stdout.trim()).toBe(text)
  })
})
