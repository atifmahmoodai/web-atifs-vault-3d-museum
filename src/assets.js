/* Asset approval gate. Pure functions so the browser and the Node checks share one rule set.
   A car model or portrait is only fetched when its manifest entry is approved, carries a licence
   on the allow-list and has a complete attribution. Everything else gets a procedural placeholder. */

export const ALLOWED_LICENCES = ['CC-BY-4.0', 'CC0-1.0', 'OWNED'];
export const REJECTED_LICENCES = ['CC-BY-NC-4.0', 'CC-BY-ND-4.0', 'CC-BY-NC-ND-4.0', 'CC-BY-NC-SA-4.0', 'EDITORIAL', 'UNKNOWN'];
export const MAX_MODEL_BYTES = 8 * 1024 * 1024;

const KEY = /^[a-z0-9_]+$/;

export function validateManifest(manifest, carKeys = []) {
  const errors = [];
  if (!manifest || !Array.isArray(manifest.assets)) return ['manifest.assets must be an array'];
  const seen = new Set();
  for (const [i, a] of manifest.assets.entries()) {
    const at = `assets[${i}]${a && a.key ? ` (${a.key})` : ''}`;
    if (!a || typeof a !== 'object') { errors.push(`${at}: not an object`); continue; }
    if (!KEY.test(a.key || '')) errors.push(`${at}: key must be lowercase a-z, 0-9 or _`);
    if (seen.has(a.key)) errors.push(`${at}: duplicate key`);
    seen.add(a.key);
    if (carKeys.length && !carKeys.includes(a.key)) errors.push(`${at}: no car with this key in CARS`);
    if (typeof a.approved !== 'boolean') errors.push(`${at}: approved must be true or false`);
    if (![...ALLOWED_LICENCES, ...REJECTED_LICENCES].includes(a.licence)) errors.push(`${at}: unrecognised licence ${a.licence}`);
    if (a.approved) {
      if (!ALLOWED_LICENCES.includes(a.licence)) errors.push(`${at}: licence ${a.licence} cannot be approved`);
      if (!a.model || !/^optimized\/[a-z0-9_]+\.glb$/.test(a.model)) errors.push(`${at}: approved asset needs model optimized/<key>.glb`);
      if (a.licence !== 'OWNED' && !(a.creator && a.title && /^https:\/\//.test(a.source || ''))) {
        errors.push(`${at}: approved CC asset needs title, creator and an https source URL`);
      }
      if (!a.approvedBy || !/^\d{4}-\d{2}-\d{2}$/.test(a.approvedOn || '')) errors.push(`${at}: approved asset needs approvedBy and approvedOn (YYYY-MM-DD)`);
      if (a.portrait && !/^portraits\/[a-z0-9_]+\.jpg$/.test(a.portrait)) errors.push(`${at}: portrait must be portraits/<key>.jpg`);
    }
  }
  return errors;
}

export function approvedAsset(manifest, key) {
  const a = (manifest && Array.isArray(manifest.assets) ? manifest.assets : []).find((x) => x && x.key === key);
  if (!a || a.approved !== true || !ALLOWED_LICENCES.includes(a.licence)) return null;
  if (validateManifest({ assets: [a] }).length) return null;
  return a;
}

/* Rows for the collection register: [car name, credit line]. Only approved assets are credited. */
export function creditsFor(manifest, cars) {
  const rows = [];
  for (const car of cars) {
    const a = approvedAsset(manifest, car.key);
    if (!a) continue;
    const by = a.licence === 'OWNED' ? 'owned asset' : `${a.creator} · ${a.licence}`;
    rows.push([car.name.toUpperCase(), by]);
  }
  return rows;
}
