import { test, expect, waitForVault } from './fixtures.js';

test('museum builds with procedural placeholders and no errors or 404s', async ({ page }) => {
  await page.goto('/index.html');
  await waitForVault(page);
  const v = await page.evaluate(() => window.__vault);
  expect(v.cars).toHaveLength(11);
  expect(v.placeholders.sort()).toEqual([...v.cars].sort());
  await expect(page.locator('h1')).toHaveText("Atif's Vault");
  expect(page.problems).toEqual([]);
});
