import { expect, test } from '@playwright/test'

// The SPA fallback serves index.html for client side routes. The document is
// served successfully, so it must not be reported as 404.
// A missing note is signalled by the API on /api/notes/<id> instead.
// https://github.com/cupcakearmy/cryptgeon/issues/217
test.describe('@web', () => {
  for (const path of ['/', '/about', '/note/does-not-exist']) {
    test(`serves ${path} with status 200`, async ({ request }) => {
      const response = await request.get(path)
      expect(response.status()).toBe(200)
    })
  }

  test('api still reports a missing note as 404', async ({ request }) => {
    const response = await request.get('/api/notes/does-not-exist')
    expect(response.status()).toBe(404)
  })
})
