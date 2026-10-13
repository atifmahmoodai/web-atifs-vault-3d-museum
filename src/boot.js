/* Runs before the 3D module: chooses the text gallery when WebGL is missing or requested, and
   falls back if the 3D engine has not built the scene within 20 s (e.g. CDN blocked). */
import { hasWebGL, showFallback } from './fallback.js';

const params = new URLSearchParams(location.search);
const manifest = fetch('assets/manifest.json').then((r) => (r.ok ? r.json() : { assets: [] })).catch(() => ({ assets: [] }));

if (params.has('nowebgl') || !hasWebGL()) {
  window.__vault = { ready: false, mode: 'fallback' };
  manifest.then((m) => showFallback(params.has('nowebgl') ? 'requested' : 'no-webgl', m));
} else {
  setTimeout(async () => {
    if (!window.__vault) showFallback('load-failed', await manifest);
  }, Number(params.get('bootTimeout')) || 20000);
}
