import { devices, type PlaywrightTestConfig } from '@playwright/test'

const config: PlaywrightTestConfig = {
  use: {
    video: 'retain-on-failure',
    baseURL: 'http://localhost:1234',
    actionTimeout: 10_000,
  },

  outputDir: './test-results',
  testDir: './test',
  timeout: 10_000,
  fullyParallel: true,

  webServer: {
    command: 'docker compose -f docker-compose.dev.yaml up',
    port: 1234,
    reuseExistingServer: true,
  },

  projects: [
    { name: 'chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'safari', use: { ...devices['Desktop Safari'] } },

    { name: 'cli', use: { ...devices['Desktop Chrome'] }, grep: [/@cli/] },
    { name: 'web', use: { ...devices['Desktop Chrome'] }, grep: [/@web/] },
    { name: 'cross', use: { ...devices['Desktop Chrome'] }, grep: [/@cross/] },
  ],
}

export default config
