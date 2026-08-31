import { test, expect } from '@playwright/test';

test('has title and redirects to login', async ({ page }) => {
  await page.goto('/');
  // Because it's protected by middleware, it should redirect to login if no auth
  await expect(page).toHaveURL(/.*\/login/);
  await expect(page.locator('h1')).toContainText('Confluence');
});
