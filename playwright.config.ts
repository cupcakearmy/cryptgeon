import type { PlaywrightTestConfig } from '@playwright/test'

const config: PlaywrightTestConfig = {
  use: {
    video: 'on-first-retry',
    baseURL: 'http://localhost:1234',
    actionTimeout: 3_000,
  },
  testDir: './test',
  testMatch: /.*\.ts/,
  webServer: {
    command: 'pnpm run dev',
    port: 1234,
    reuseExistingServer: true,
  },
}

export default config
