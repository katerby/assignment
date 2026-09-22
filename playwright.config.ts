import { defineConfig, devices } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'https://opensource-demo.orangehrmlive.com',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'authentication',
      testMatch: '**/authentication.spec.ts',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'setup',
      testMatch: '**/*.setup.ts'
    },
    {
      name: 'chromium',
      testIgnore: ['**/authentication.spec.ts', '**/*.setup.ts'],
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: authFile
      }
    }
  ]
});
