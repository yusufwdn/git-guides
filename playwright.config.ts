import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';

const executablePath =
  process.env.BROWSER_EXECUTABLE ||
  [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  ].find(existsSync);
const port = Number(process.env.BROWSER_TEST_PORT || 4323);
export default defineConfig({
  testDir: './tests/browser',
  workers: 1,
  timeout: 45000,
  reporter: 'list',
  globalSetup: './tests/browser/global-setup.mjs',
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    browserName: 'chromium',
    reducedMotion: 'reduce',
    launchOptions: executablePath ? { executablePath } : {},
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
});
