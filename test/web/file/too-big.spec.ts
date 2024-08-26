import { test } from '@playwright/test'
import { Files } from '../../files'
import { createNoteError } from '../../utils'

test.describe('@web', () => {
  test('to big zip', async ({ page }) => {
    const files = [Files.Zip]
    await createNoteError(page, { files }, 'note is to big')
  })
})
