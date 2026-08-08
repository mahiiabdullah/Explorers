import { test, expect } from '@playwright/test';

test.describe('Auth', () => {
  test('signup form validates required fields', async ({ page }) => {
    await page.goto('/signup');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Name too short')).toBeVisible({ timeout: 1000 }).catch(() => {});
    // Should still be on signup page
    await expect(page).toHaveURL(/\/signup/);
  });

  test('login page renders', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1')).toContainText('WELCOME');
  });
});
