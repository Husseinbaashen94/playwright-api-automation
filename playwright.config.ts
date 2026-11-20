import { existsSync } from 'node:fs';
import { defineConfig } from '@playwright/test';

// Optional local settings: copy .env.example to .env. Empty values fall back to the defaults.
if (existsSync('.env')) process.loadEnvFile('.env');

export const BASE_URL = process.env.BASE_URL || 'https://restful-booker.herokuapp.com';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // Public shared API: keep concurrency polite.
  workers: 4,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: BASE_URL,
    extraHTTPHeaders: {
      Accept: 'application/json',
    },
  },
});
