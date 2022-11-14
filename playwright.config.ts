import { devices, type PlaywrightTestConfig } from '@playwright/test'

const config: PlaywrightTestConfig = {
  use: {
    video: 'retain-on-failure',
    baseURL: 'http://localhost:1234',
    actionTimeout: 60_000,
  },

  outputDir: './test-results',
  testDir: './test',
  timeout: 60_000,
  // testIgnore: ['file/too-big.spec.ts'],

  webServer: {
    command: 'docker compose -f docker-compose.dev.yaml up',
    port: 1234,
    reuseExistingServer: true,
  },

  projects: [
    { name: 'chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'safari', use: { ...devices['Desktop Safari'] } },
    {
      name: 'local',
      use: { ...devices['Desktop Chrome'] },
      // testMatch: 'file/too-big.spec.ts',
    },
  ],
}

export default config
