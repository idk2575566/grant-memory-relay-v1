const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'off'
  },
  webServer: {
    command: 'python3 -m http.server 4173',
    port: 4173,
    reuseExistingServer: true,
    timeout: 15_000
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-390x844', use: { ...devices['Pixel 7'] } },
    { name: 'mobile-360x800', use: { viewport: { width: 360, height: 800 }, userAgent: devices['Pixel 5'].userAgent, deviceScaleFactor: 2, isMobile: true, hasTouch: true } }
  ]
});
