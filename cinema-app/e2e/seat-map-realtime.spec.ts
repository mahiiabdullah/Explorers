import { test, expect } from '@playwright/test';

test.describe('Real-time seat map', () => {
  test('two tabs sync seat state', async ({ browser }) => {
    const ctx = await browser.newContext();
    const tabA = await ctx.newPage();
    const tabB = await ctx.newPage();

    // Both navigate to the same showtime
    await tabA.goto('/showtimes/101/seat-map');
    await tabB.goto('/showtimes/101/seat-map');

    // Tab A selects a seat
    const seatInA = tabA.locator('button[aria-label*="A1"]');
    await seatInA.click();

    // Tab B should reflect the change within a few seconds
    await tabB.waitForTimeout(1000);
    const seatInB = tabB.locator('button[aria-label*="A1"]');

    // After real-time update, A1 in Tab B should be marked selected or held
    await expect(seatInB).not.toHaveAttribute('aria-label', /Seat A1, .*, available/);

    await ctx.close();
  });
});
