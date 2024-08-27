import { devices, type PlaywrightTestConfig } from '@playwright/test'

const config: PlaywrightTestConfig = {
  use: {
    video: 'retain-on-failure',
    baseURL: 'http://localhost:3000',
    actionTimeout: 30_000,
  },

  outputDir: './test-results',
  testDir: './test',
  timeout: 30_000,

  webServer: {
    command: 'pnpm run docker:up',
    port: 3000,
    reuseExistingServer: true,
  },

  projects: [
    { name: 'chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'safari', use: { ...devices['Desktop Safari'] } },
  ],
}

export default config
