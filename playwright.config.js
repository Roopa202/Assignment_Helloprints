// @ts-check
const { defineConfig } = require('@playwright/test');

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

module.exports = defineConfig({
  testDir: './tests',
  timeout: 55 * 1000,

  use: {
    headless: false,
    channel: "chrome",  // ← real Chrome
    locale: "en-US",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
    viewport: { width: 1400, height: 800 },
    ignoreHTTPSErrors: true,
    launchOptions: {
    args: [
      "--disable-features=TranslateUI",
      "--disable-features=Translation",
      "--disable-features=Translate"
    ]
  },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure'
  },

  reporter: [
    [
      'html',
      {
        outputFolder: `reports/${timestamp}`,
        open: 'never'
      }
    ]
  ],
});
