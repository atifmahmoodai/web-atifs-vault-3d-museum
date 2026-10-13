import { readFileSync } from 'node:fs';
import { test, expect, waitForVault } from './fixtures.js';

const budget = JSON.parse(readFileSync(new URL('../../perf-budget.json', import.meta.url)));

test('page weight, requests and origins stay within budget', async ({ page }) => {
  const started = Date.now();
  await page.goto('/index.html');
  await waitForVault(page);
  const readyMs = Date.now() - started;
  const entries = await page.evaluate(() => [
    { name: location.href, size: performance.getEntriesByType('navigation')[0].decodedBodySize },
    ...performance.getEntriesByType('resource').map((e) => ({ name: e.name, size: e.decodedBodySize })),
  ]);
  const firstParty = entries.filter((e) => e.name.startsWith('http://127.0.0.1:4173/'));
  const thirdParty = entries.filter((e) => !e.name.startsWith('http://127.0.0.1:4173/'));
  const bytes = firstParty.reduce((n, e) => n + e.size, 0);
  console.log(`first-party ${bytes} B in ${firstParty.length} files; ${thirdParty.length} third-party; ready ${readyMs} ms`);
  expect(bytes).toBeLessThanOrEqual(budget.firstPartyBytes);
  expect(entries.length).toBeLessThanOrEqual(budget.maxRequests);
  for (const e of thirdParty) expect(budget.allowedThirdPartyPrefixes.some((p) => e.name.startsWith(p)), e.name).toBe(true);
  expect(readyMs).toBeLessThanOrEqual(budget.readyMs);
});

test('scene stays within draw-call, triangle, geometry and texture budgets', async ({ page }) => {
  await page.goto('/index.html');
  await waitForVault(page);
  await page.evaluate(() => { document.getElementById('blocker').style.display = 'none'; });
  await page.waitForTimeout(500);
  const s = await page.evaluate(() => window.__vault.stats());
  console.log(JSON.stringify(s));
  expect(s.calls).toBeLessThanOrEqual(budget.drawCalls);
  expect(s.triangles).toBeLessThanOrEqual(budget.triangles);
  expect(s.geometries).toBeLessThanOrEqual(budget.geometries);
  expect(s.textures).toBeLessThanOrEqual(budget.textures);
});

test.describe('high-density display', () => {
  test.use({ deviceScaleFactor: 3 });
  test('pixel ratio is capped', async ({ page }) => {
    await page.goto('/index.html');
    await waitForVault(page);
    expect((await page.evaluate(() => window.__vault.stats())).pixelRatio).toBeLessThanOrEqual(budget.maxPixelRatio);
  });
});
