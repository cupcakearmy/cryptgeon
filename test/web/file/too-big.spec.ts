import { test } from '@playwright/test'
import { createNote } from '../../utils'
import { Files } from '../../files'

test.describe('@web', () => {
  test('to big zip', async ({ page }) => {
    const files = [Files.Zip]
    await createNote(page, { files, error: 'note is to big' })
  })
})
