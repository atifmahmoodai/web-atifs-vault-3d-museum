import AxeBuilder from '@axe-core/playwright';
import { test, expect, waitForVault } from './fixtures.js';

const axe = (page) => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']);
const noWebGL = () => {
  const orig = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
    return /webgl/.test(type) ? null : orig.call(this, type, ...rest);
  };
};

test('entry screen has no axe violations and is keyboard operable', async ({ page }) => {
  await page.goto('/index.html');
  await waitForVault(page);
  expect((await axe(page).analyze()).violations).toEqual([]);
  await page.keyboard.press('Tab');
  await expect(page.locator('#enter')).toBeFocused();
  await expect(page.locator('canvas')).toHaveAttribute('aria-label', /3D view/);
});

test('without WebGL the text gallery replaces the 3D scene and passes axe', async ({ page }) => {
  await page.addInitScript(noWebGL);
  await page.goto('/index.html');
  await waitForVault(page);
  expect(await page.evaluate(() => window.__vault.mode)).toBe('fallback');
  await expect(page.locator('#fbReason')).toContainText('does not offer WebGL');
  await expect(page.locator('#fallback li')).toHaveCount(11);
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.locator('#blocker')).toHaveCount(0);
  expect((await axe(page).analyze()).violations).toEqual([]);
  expect(page.problems).toEqual([]);
});

test('text-only gallery can be requested from the entry screen', async ({ page }) => {
  await page.goto('/index.html');
  await waitForVault(page);
  await page.getByRole('link', { name: 'Text-only gallery' }).click();
  await waitForVault(page);
  await expect(page.locator('#fbReason')).toContainText('asked for the text-only gallery');
  await expect(page.locator('#fallback li').first()).toContainText('Ferrari 288 GTO');
});

test('if the 3D engine never loads, the gallery appears instead of a blank page', async ({ page }) => {
  await page.route('https://unpkg.com/**', (r) => r.abort());
  page.problems.length = 0;
  await page.goto('/index.html?bootTimeout=1500');
  await waitForVault(page);
  await expect(page.locator('#fbReason')).toContainText('did not load');
});

test('reduced motion freezes turntables, tickers and camera sweeps', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/index.html');
  await waitForVault(page);
  expect(await page.evaluate(() => window.__vault.reducedMotion)).toBe(true);
  const before = await page.evaluate(() => [window.__vault.turntableAngles(), window.__vault.tickerOffsets()]);
  await page.waitForTimeout(1200);
  const after = await page.evaluate(() => [window.__vault.turntableAngles(), window.__vault.tickerOffsets()]);
  expect(after).toEqual(before);
});

test('with motion allowed the visible turntables do spin', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/index.html');
  await waitForVault(page);
  const before = await page.evaluate(() => window.__vault.turntableAngles());
  await page.waitForTimeout(1200);
  const after = await page.evaluate(() => window.__vault.turntableAngles());
  expect(after.some((a, i) => a !== before[i])).toBe(true);
});
