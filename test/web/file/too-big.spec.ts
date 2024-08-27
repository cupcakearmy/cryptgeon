import { test } from '@playwright/test'
import { Files } from '../../files'
import { createNoteError } from '../../utils'

test.describe('@web', () => {
  test.skip('to big zip', async ({ page }) => {
    const files = [Files.Zip]
    await createNoteError(page, { files }, 'could not create note. note is too big')
  })
})
