[README.md](https://github.com/user-attachments/files/30840246/README.md)
# Atif's Vault

A walkable 3D car museum that runs in a browser tab. One HTML file, no build step, no game engine.

Every surface of the building — the tiled floor, the wall signage, the backlit sign, the LED tickers wrapping each plinth, the vending machine — is drawn in code at runtime. No textures are downloaded for any of it.

**The car models are not in this repo.** They're Creative Commons work by eleven different creators, and redistributing them here would strip the attribution from the file. This README shows you how to get your own — or the same eleven, if you want to rebuild it exactly.

---

## What you end up with

- A 24×24 m lobby with two wings, walkable with WASD + mouse
- Eleven cars on turntables that only spin when you're near them and looking at them
- A red dot-matrix ticker wrapped around every plinth, each running its own car's name and description
- A golden LED ring on the ceiling running a scrolling welcome message
- A backlit sign on the north wall
- Proximity info cards, scroll-wheel zoom, a credits register on the back wall

Runs at 60fps on modest hardware. No shadow maps, no post-processing.

---

## What you need

| Thing | Why |
|---|---|
| A browser | Chrome or Edge. Firefox works. |
| Node.js | Only for optimizing models. [nodejs.org](https://nodejs.org) |
| A local web server | ES modules won't load from `file://` |
| A Sketchfab account | Free. To download models. |

No React, no bundler, no npm install for the site itself. Three.js loads from a CDN via an import map.

---

## Step 1 — Get the folder structure right

```
your-project/
├── index.html          ← this repo
├── optimized/          ← your .glb car models
│   ├── ferrari.glb
│   ├── charger.glb
│   └── ...
└── portraits/          ← optional .jpg photos for the wall frames
    ├── ferrari.jpg
    ├── charger.jpg
    └── ...
```

The `portraits/` folder is optional. Without it the wall frames still render with the car's name, index number and wing label — just no photo. The build handles missing images without erroring.

---

## Step 2 — Find models on Sketchfab

Go to [sketchfab.com](https://sketchfab.com) and search for your car. Then **filter hard**, because this matters more than the search term:

1. **Downloadable** → on
2. **License** → *Creative Commons Attribution* (CC-BY). Free to use commercially, as long as you credit the creator.
3. **Format** → glTF

Avoid CC-BY-NC (no commercial use — a problem if your video is monetized) and CC-BY-ND (no derivatives — you're scaling and repositioning, which arguably counts).

**What makes a model good here:**

- **Under ~8 MB** after optimization. Eleven cars load sequentially, and a 40 MB model stalls the whole queue.
- **Has an interior**, or at least tinted glass. You walk right up to these.
- **Clean wheels.** Wheels are where cheap models fall apart, and they're at eye level when you approach.
- **Baked lighting is fine.** The scene has soft ambient light, so pre-lit models sit in nicely.

Download the **glTF** option, not FBX or OBJ. You'll get a `.zip` — inside is either a `.gltf` with separate texture files, or a single `.glb`.

**Write down the creator's name before you close the tab.** You'll need it for the credits wall.

---

## Step 3 — Optimize the models

Raw Sketchfab downloads are often 20–80 MB. Eleven of those is a site nobody waits for. The eleven in the original build came to ~30 MB total after this step, largest 7.2 MB.

Install the tool:

```bash
npm install -g @gltf-transform/cli
```

If you got a `.gltf` with loose files, pack it to `.glb` first:

```bash
gltf-transform copy scene.gltf car.glb
```

Then optimize:

```bash
gltf-transform optimize car.glb optimized/ferrari.glb \
  --texture-compress webp \
  --texture-size 2048 \
  --compress draco
```

What each flag does:

- `--texture-compress webp` — usually the biggest single win, often 60–70% off texture weight
- `--texture-size 2048` — caps texture resolution. 4K textures are wasted at gallery viewing distance. Drop to 1024 if a model is still huge.
- `--compress draco` — mesh compression. Three.js decodes it automatically here; the loader is already wired up in `index.html`.

Check the result:

```bash
gltf-transform inspect optimized/ferrari.glb
```

If a car is still over 10 MB, re-run with `--texture-size 1024`.

**Name the output files to match your `CARS` array keys** (next step). Lowercase, no spaces, underscores if you need a separator: `bmw_m4.glb`, `amg_gt3.glb`.

---

## Step 4 — Register your cars in `index.html`

Find the `CARS` array near the top of the script block. Each entry:

```js
{ key:'ferrari',   file:'optimized/ferrari.glb',   x:0, z:0, wing:'HERO', idx:'00', yOff:0.04,
  name:'Ferrari 288 GTO', len:4.6,
  blurb:'Born for a Group B era that never came — a twin-turbo V8 in the body that started the modern Ferrari supercar line. 272 built.' },
```

| Field | What it does |
|---|---|
| `key` | Internal ID. Must match the portrait filename (`portraits/ferrari.jpg`). |
| `file` | Path to the .glb |
| `x`, `z` | Position in metres. Lobby centre is `0,0`. |
| `wing` | `'HERO'`, `'A'` (west) or `'B'` (east) |
| `idx` | The number shown on the wall plaque |
| `len` | **Target length in metres.** The build scales every model to this. See below. |
| `yOff` | Optional vertical nudge if a model sits slightly wrong |
| `name` | Shown on the plaque, the info card, and the plinth ticker |
| `blurb` | Shown on the info card and scrolling round the plinth |

**`len` is the important one.** Downloaded models arrive at wildly inconsistent scales — one creator's "1 unit" is a metre, another's is a centimetre. Rather than fight that, the build measures each model's bounding box and uniformly scales it so its longest axis equals `len`. Real cars are roughly 4.3–4.6 m, so that's what's used here. Set it and every model comes out the right size regardless of how it was exported.

**Positions for the default layout:**

- Hero: `x:0, z:0`
- Wing A (west): `x` at −17, −24, −31, −38, −45, alternating `z:3.2` / `z:-3.2`
- Wing B (east): same but positive `x`

The alternating `z` is deliberate — walking the centre line of a wing puts cars on alternating sides, which gives you real parallax.

---

## Step 5 — Credit the creators

Find the `CREDITS` array:

```js
const CREDITS = [
  ['FERRARI 288 GTO','Randomness'],
  ['1969 DODGE CHARGER R/T','Galaxy Car Showroom'],
  // ...
];
```

Car name, then the Sketchfab creator's username. This renders as a register on the lobby's south wall — visible inside the building, where people walk past it.

**Don't skip this.** CC-BY is a licence with one condition, and this is that condition. Putting it on the wall rather than in a description box costs you nothing and it's the right thing to do.

---

## Step 6 — Run it

You need a real web server. Opening `index.html` directly won't work — ES modules and import maps are blocked over `file://`.

Pick one:

```bash
# Python (already installed on most machines)
python3 -m http.server 8000

# Node
npx serve

# VS Code
# Install "Live Server", right-click index.html → Open with Live Server
```

Then open `http://localhost:8000`.

Click to enter. **WASD** to move, **mouse** to look, **Shift** to run, **scroll** to zoom, **Esc** for the menu.

---

## Things you'll probably want to change

**The room dimensions.** Search for `ROOMS` — an array of rectangles defining where you're allowed to stand. If you move walls, update these or you'll walk through them.

**The welcome message.** `TICKER_MSG`, near the LED strip builder.

**The sign text.** In the sign block, look for `ATIF'S VAULT` and `PRIVATE COLLECTION`. The box around the collection line measures itself, so longer text won't overflow.

**The colours.** `#d21f2b` is the red running through the floor tiles and signage. The plinth tickers use `LED_RED`, the ceiling uses `LED_GOLD`.

**Scroll speed.** The tickers all move at 0.95 m/s regardless of message length. Search for `0.95 / built.segWorld`.

---

## How a few things work, if you're curious

**Finding the ground.** You can't just use a model's lowest point to sit it on the plinth — one stray vertex hanging below the car lifts the whole thing into the air. Instead the build samples up to 6,000 vertices per mesh, sorts them by height, and looks for the first height where the geometry gets *dense*. That's the tyres. It also detects and hides the flat baked shadow planes that many Sketchfab models ship with.

**The tickers.** Car descriptions are all different lengths, so stretching text to fit the plinth would make short ones fat and long ones unreadable. Instead the builder measures the text, works out how wide that message is *in metres* at the display's physical height, then tiles as many whole copies around the circumference as fit evenly. Letters end up the same physical size on every plinth, and a whole-number repeat count means the loop has no seam.

**Repainting a car.** The Mustang model arrives yellow and should be dark green — but it's a race car, and its livery lives in the same texture as its paint. Setting `material.color` would tint the decals too. So it reads the texture into a canvas, converts each pixel to HSL, and only rewrites pixels inside the yellow hue band. Whites, blacks and reds fall outside and pass through untouched. See `REPAINT` and `repaintCar`.

**Performance.** Turntables and tickers only animate when within 28 m *and* inside the camera frustum. No shadow maps at all — the shadows under the cars are canvas-drawn gradient sprites. Pixel ratio capped at 1.75, anisotropy at 8.

---

## Licence

The code in `index.html` is MIT — do what you like with it.

The car models are **not** included and are **not** covered by that. Each is Creative Commons Attribution and belongs to its creator. If you use the same eleven, keep the `CREDITS` array intact.

---

## Credits

Built with [Three.js](https://threejs.org). Car models by the eleven Sketchfab creators listed in `CREDITS` inside `index.html` — and on the wall, in the building.
