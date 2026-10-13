import test from 'node:test';
import assert from 'node:assert/strict';
import { validateManifest, approvedAsset, creditsFor } from '../../src/assets.js';

const good = { key: 'supra', title: 'Supra', creator: 'Fictional Modeller', licence: 'CC-BY-4.0',
  source: 'https://example.com/models/supra', model: 'optimized/supra.glb', approved: true,
  approvedBy: 'Atif', approvedOn: '2026-10-13' };
const cars = [{ key: 'supra', name: 'Toyota Supra' }, { key: 'aston', name: 'Aston' }];

test('approved CC-BY asset with full attribution passes and is credited', () => {
  const m = { assets: [good, { ...good, key: 'aston', approved: false }] };
  assert.deepEqual(validateManifest(m, ['supra', 'aston']), []);
  assert.equal(approvedAsset(m, 'supra').model, 'optimized/supra.glb');
  assert.equal(approvedAsset(m, 'aston'), null);
  assert.deepEqual(creditsFor(m, cars), [['TOYOTA SUPRA', 'Fictional Modeller · CC-BY-4.0']]);
});

test('non-commercial, no-derivatives and unknown licences can never be approved', () => {
  for (const licence of ['CC-BY-NC-4.0', 'CC-BY-ND-4.0', 'UNKNOWN']) {
    const m = { assets: [{ ...good, licence }] };
    assert.ok(validateManifest(m).some((e) => e.includes('cannot be approved')), licence);
    assert.equal(approvedAsset(m, 'supra'), null);
  }
  assert.ok(validateManifest({ assets: [{ ...good, licence: 'GPL' }] }).some((e) => e.includes('unrecognised')));
});

test('missing attribution, approval record or bad paths block approval', () => {
  for (const patch of [{ creator: '' }, { source: 'http://insecure' }, { approvedOn: '' }, { approvedBy: '' },
    { model: 'https://cdn.example.com/x.glb' }, { portrait: '../secret.jpg' }]) {
    const m = { assets: [{ ...good, ...patch }] };
    assert.ok(validateManifest(m).length > 0, JSON.stringify(patch));
    assert.equal(approvedAsset(m, 'supra'), null);
  }
});

test('owned assets need no creator but still need an approval record', () => {
  const owned = { key: 'supra', licence: 'OWNED', model: 'optimized/supra.glb', approved: true, approvedBy: 'Atif', approvedOn: '2026-10-13' };
  assert.deepEqual(validateManifest({ assets: [owned] }), []);
  assert.deepEqual(creditsFor({ assets: [owned] }, cars), [['TOYOTA SUPRA', 'owned asset']]);
});

test('duplicate keys, unknown cars and bad shapes are reported', () => {
  const errs = validateManifest({ assets: [good, good, { ...good, key: 'ghost' }] }, ['supra']);
  assert.ok(errs.some((e) => e.includes('duplicate')));
  assert.ok(errs.some((e) => e.includes('no car')));
  assert.deepEqual(validateManifest({}), ['manifest.assets must be an array']);
});

test('the committed register approves nothing: every car is a placeholder', async () => {
  const { readFileSync } = await import('node:fs');
  const m = JSON.parse(readFileSync(new URL('../../assets/manifest.json', import.meta.url)));
  assert.equal(m.assets.length, 11);
  assert.deepEqual(validateManifest(m), []);
  assert.ok(m.assets.every((a) => approvedAsset(m, a.key) === null));
});
