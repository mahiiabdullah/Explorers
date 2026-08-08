import { test, expect } from '@playwright/test';

test.describe('Booking flow', () => {
  test('user can browse → select seats → proceed to payment', async ({ page }) => {
    await page.goto('/movies');
    await expect(page.locator('h1')).toContainText('ALL MOVIES');

    // Click first movie
    await page.locator('a[href^="/movies/"]').first().click();
    await expect(page).toHaveURL(/\/movies\/\d+/);

    // Click first showtime
    await page.locator('a[href*="/seat-map"]').first().click();
    await expect(page).toHaveURL(/seat-map/);

    // Wait for seat map
    await expect(page.locator('text=PICK YOUR SEATS')).toBeVisible();

    // Click first available seat (not disabled)
    const seats = page.locator('button[aria-label*="available"]');
    await seats.first().click();

    // Continue button visible
    await expect(page.locator('text=YOUR SELECTION')).toBeVisible();
  });

  test('landing page renders hero', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=YOUR SEAT')).toBeVisible();
    await expect(page.locator('text=YOUR STORY')).toBeVisible();
  });
});
