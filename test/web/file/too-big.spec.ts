import { test } from '@playwright/test'
import { createNote } from '../../utils'
import { Files } from '../../files'

test.describe('@web', () => {
  test.skip('to big zip', async ({ page }) => {
    const files = [Files.Zip]
    const link = await createNote(page, { files, error: 'note is to big' })
  })
})
