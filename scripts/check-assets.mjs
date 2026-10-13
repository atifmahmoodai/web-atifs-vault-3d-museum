// Fails CI when the asset register is invalid, an approved file is missing or over budget,
// or a model/portrait is committed without an approved manifest entry.
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { validateManifest, approvedAsset, MAX_MODEL_BYTES } from '../src/assets.js';

const root = new URL('..', import.meta.url).pathname;
const html = readFileSync(root + 'index.html', 'utf8');
const carKeys = [...html.matchAll(/\{ key:'([a-z0-9_]+)'/g)].map((m) => m[1]);
const manifest = JSON.parse(readFileSync(root + 'assets/manifest.json', 'utf8'));
const errors = validateManifest(manifest, carKeys);

for (const key of carKeys) {
  if (!manifest.assets.some((a) => a.key === key)) errors.push(`car ${key} has no manifest entry`);
  const a = approvedAsset(manifest, key);
  if (!a) continue;
  for (const f of [a.model, a.portrait].filter(Boolean)) {
    if (!existsSync(root + f)) errors.push(`${key}: approved file ${f} is missing`);
    else if (f.endsWith('.glb') && statSync(root + f).size > MAX_MODEL_BYTES) errors.push(`${key}: ${f} is over 8 MB`);
  }
}
const allowed = new Set(manifest.assets.filter((a) => approvedAsset(manifest, a.key)).flatMap((a) => [a.model, a.portrait]));
for (const dir of ['optimized', 'portraits']) {
  if (!existsSync(root + dir)) continue;
  for (const f of readdirSync(root + dir)) {
    if (!allowed.has(`${dir}/${f}`) && f !== '.gitkeep') errors.push(`${dir}/${f} is committed without an approved manifest entry`);
  }
}
const approved = carKeys.filter((k) => approvedAsset(manifest, k)).length;
console.log(`Cars: ${carKeys.length}; approved models: ${approved}; procedural placeholders: ${carKeys.length - approved}`);
for (const e of errors) console.error('ERROR:', e);
process.exit(errors.length ? 1 : 0);
