# PROJECT — Atif's Vault (3D car museum)

## Build status

- Gap closed: the museum previously needed licensed third-party car models to show anything. It now ships 11 procedural placeholder cars and an approval register (`assets/manifest.json`) with a licence/attribution gate (`src/assets.js`); no third-party model is loaded or credited until the owner approves it.
- Added an accessible no-WebGL text gallery (missing WebGL, renderer failure, engine load timeout, `?nowebgl`), `prefers-reduced-motion` support, an axe-clean keyboard-operable entry screen, and a CI-enforced performance budget (`perf-budget.json`).
- Tests: 6 unit tests (licence gate), asset-register check, 10 Playwright tests (smoke, axe ×2, fallbacks ×3, reduced motion ×2, performance budget ×3 incl. pixel-ratio cap).
- CI: `.github/workflows/ci.yml` (unit + assets job; Playwright + axe job in Chromium/SwiftShader).
- Remaining owner action: confirm licences and approve real models in the manifest. Frame-rate on real GPUs is not measured in CI (SwiftShader is software rendering); budgets cover the work per frame instead.
- Data: the collection descriptions are the original content; no personal data, no external APIs, no secrets.
