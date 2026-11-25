import { expect, test } from '@playwright/test';

test('home page loads without uncaught errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));

  const response = await page.goto('/');
  await page.waitForLoadState('load');

  expect(response?.ok()).toBe(true);
  await expect(page.locator('body')).toBeVisible();
  expect(errors).toEqual([]);
});
