/* Accessible, motion-free text gallery shown when WebGL is unavailable, the 3D engine fails to
   load, or the visitor asks for it (?nowebgl). Same collection data as the 3D museum. */
import { CARS, WING_LABEL } from './cars.js';
import { approvedAsset } from './assets.js';

const REASONS = {
  'no-webgl': 'Your browser or device does not offer WebGL, so here is the collection as a text gallery.',
  'requested': 'You asked for the text-only gallery.',
  'renderer-failed': 'The 3D renderer could not start on this device, so here is the collection as a text gallery.',
  'load-failed': 'The 3D engine did not load (network or content blocker), so here is the collection as a text gallery.',
};

export function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch { return false; }
}

const esc = (t) => String(t).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

export function showFallback(reason, manifest = { assets: [] }) {
  const main = document.getElementById('fallback');
  const items = CARS.map((c) => {
    const a = approvedAsset(manifest, c.key);
    const credit = a ? (a.licence === 'OWNED' ? 'Owned model' : `Model: ${esc(a.creator)} · ${esc(a.licence)}`) : 'Shown as a procedural placeholder in 3D';
    return `<li><div class="meta">${esc(WING_LABEL[c.wing])}${c.wing === 'HERO' ? '' : ' · ' + c.wing + c.idx}</div>
      <h3>${esc(c.name)}</h3><p>${esc(c.blurb)}</p><p class="meta">${credit}</p></li>`;
  }).join('');
  main.innerHTML = `<h1 id="fbTitle">Atif's Vault</h1>
    <p id="fbReason" role="status">${esc(REASONS[reason] || REASONS['no-webgl'])}</p>
    <h2>The collection · ${CARS.length} machines</h2><ol>${items}</ol>
    <p><a href="./">Try the 3D museum</a></p>`;
  main.hidden = false;
  for (const id of ['blocker', 'hud', 'stage']) { const el = document.getElementById(id); if (el) el.remove(); }
  window.__vault = { ...(window.__vault || {}), ready: true, mode: 'fallback', reason, cars: CARS.map((c) => c.key) };
  document.documentElement.dataset.vaultReady = '1';
}
