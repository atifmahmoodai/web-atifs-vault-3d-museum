/* Shared fixture: serve Three.js from node_modules instead of the CDN, so tests are offline and
   pinned to the same version as the import map, and record console errors and failed requests. */
import { test as base, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const threeRoot = fileURLToPath(new URL('../../node_modules/three/', import.meta.url));

export const test = base.extend({
  page: async ({ page }, use) => {
    const problems = [];
    page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
    page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
    page.on('requestfailed', (r) => problems.push('requestfailed: ' + r.url()));
    page.on('response', (r) => { if (r.status() >= 400) problems.push(`http ${r.status()}: ${r.url()}`); });
    await page.route('https://unpkg.com/three@0.160.0/**', (route) => {
      const path = new URL(route.request().url()).pathname.replace('/three@0.160.0/', '');
      route.fulfill({ body: readFileSync(threeRoot + path), contentType: 'text/javascript' });
    });
    page.problems = problems;
    await use(page);
  },
});
export { expect };

export async function waitForVault(page) {
  await page.waitForFunction(() => window.__vault && window.__vault.ready === true, null, { timeout: 30_000 });
}
