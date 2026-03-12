const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  const errors = [];
  page.on('pageerror', (err) => errors.push(`pageerror:${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console:${msg.text()}`);
  });
  page.__errors = errors;
});

test('core flow works with no uncaught errors', async ({ page }) => {
  await page.goto('/index.html');

  await page.getByRole('textbox', { name: /what matters/i }).fill('Smoke note');
  await page.getByRole('button', { name: /save note/i }).click();

  await expect(page.locator('#notes-list .note-main').first()).toHaveText('Smoke note');
  await expect(page.locator('#open-count')).toContainText('1 open');

  await page.getByRole('button', { name: /done/i }).first().click();
  await expect(page.locator('#open-count')).toContainText('0 open');

  expect(page.__errors, page.__errors?.join('\n')).toEqual([]);
});

test('voice fallback is safe when unsupported', async ({ page, context }) => {
  await context.addInitScript(() => {
    // simulate unsupported browsers
    window.SpeechRecognition = undefined;
    window.webkitSpeechRecognition = undefined;
  });
  await page.goto('/index.html');

  await expect(page.locator('#voice-status')).toContainText(/unsupported/i);
  await expect(page.locator('#voice-btn')).toBeDisabled();

  expect(page.__errors, page.__errors?.join('\n')).toEqual([]);
});
