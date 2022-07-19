import { devices, type PlaywrightTestConfig } from '@playwright/test'

const config: PlaywrightTestConfig = {
  use: {
    video: 'retain-on-failure',
    baseURL: 'http://localhost:1234',
    // actionTimeout: 10_000,
  },
  outputDir: './test-results',
  testDir: './test',
  testMatch: /.*\.ts/,
  webServer: {
    command: 'pnpm run ci:server',
    port: 1234,
    reuseExistingServer: true,
    timeout: 20_000,
  },
  projects: [
    { name: 'Chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'Firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'Safari', use: { ...devices['Desktop Safari'] } },
  ],
}

export default config
