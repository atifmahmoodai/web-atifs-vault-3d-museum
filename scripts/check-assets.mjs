// Fails CI when the asset register is invalid, an approved file is missing or over budget,
// or a model/portrait is committed without an approved manifest entry.
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { validateManifest, approvedAsset, MAX_MODEL_BYTES } from '../src/assets.js';

const root = new URL('..', import.meta.url).pathname;
const carsSrc = readFileSync(root + 'src/cars.js', 'utf8');
const carKeys = [...carsSrc.matchAll(/\{ key:'([a-z0-9_]+)'/g)].map((m) => m[1]);
const manifest = JSON.parse(readFileSync(root + 'assets/manifest.json', 'utf8'));
const budget = JSON.parse(readFileSync(root + 'perf-budget.json', 'utf8'));
const errors = validateManifest(manifest, carKeys);
let modelBytes = 0;
if (carKeys.length === 0) errors.push('no cars found in src/cars.js');

for (const key of carKeys) {
  if (!manifest.assets.some((a) => a.key === key)) errors.push(`car ${key} has no manifest entry`);
  const a = approvedAsset(manifest, key);
  if (!a) continue;
  for (const f of [a.model, a.portrait].filter(Boolean)) {
    if (!existsSync(root + f)) errors.push(`${key}: approved file ${f} is missing`);
    else if (f.endsWith('.glb')) {
      const size = statSync(root + f).size;
      modelBytes += size;
      if (size > Math.min(MAX_MODEL_BYTES, budget.maxModelBytes)) errors.push(`${key}: ${f} is ${size} B, over the per-model budget`);
    }
  }
}
const allowed = new Set(manifest.assets.filter((a) => approvedAsset(manifest, a.key)).flatMap((a) => [a.model, a.portrait]));
for (const dir of ['optimized', 'portraits']) {
  if (!existsSync(root + dir)) continue;
  for (const f of readdirSync(root + dir)) {
    if (!allowed.has(`${dir}/${f}`) && f !== '.gitkeep') errors.push(`${dir}/${f} is committed without an approved manifest entry`);
  }
}
if (modelBytes > budget.totalModelBytes) errors.push(`approved models total ${modelBytes} B, over the ${budget.totalModelBytes} B budget`);
const approved = carKeys.filter((k) => approvedAsset(manifest, k)).length;
console.log(`Cars: ${carKeys.length}; approved models: ${approved}; procedural placeholders: ${carKeys.length - approved}; model bytes ${modelBytes}/${budget.totalModelBytes}`);
for (const e of errors) console.error('ERROR:', e);
process.exit(errors.length ? 1 : 0);
