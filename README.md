# Poly Tourismo

A low-poly 3D racing game that ships as **one HTML file** (Three.js r128). Open `dist/Poly-Tourismo.html` in a browser and play.

## Modes
- **Time Attack** – chase medals and your own ghost lap (forward or reverse)
- **Local Multiplayer** – 1–4 humans plus CPUs, split-screen that merges when players are close
- **Cut-Up** – weave through traffic for score
- **Career** – earn Cr., buy cars in Brand Central, climb the class ranks D → S

7 tracks (4 tarmac incl. a night city, 3 gravel rally), 14 cars with real-life gear counts, tyre wear, fuel and pit stops, slipstreaming, time of day, and an audio engine with per-car engine voices.

## Controls
| Player | Keys |
|---|---|
| P1 | W A S D (double-tap W / S to shift up / down) |
| P2 | Arrow keys |
| P3 | I J K L |
| P4 | T F G H |

Controllers work for all four players (stick steers, triggers drive, RB/LB or D-pad shift). Auto-shift is in Options → Driving.

## Project layout
```
base/Poly-Tourismo-v7.html   original single-file game (includes car pack 1 as base64)
src/layers/*.js              the v9 game code, applied on top of the base in this order:
                             core, audio, modes, tracks, extra, race2, tod, shade, ui
src/style.css                v9 UI styles
assets/car_pack_2.glb        car pack 2 (embedded as base64 at build time)
build.py                     base + text patches + layers + css + pack 2  ->  dist/Poly-Tourismo.html

tests/                       Playwright simulation scripts (headless, software GL)
```

Layers extend the base game by wrapping its globals (`stepCar`, `hudUpdate`, `launch`, …) and share state through `window.PT8`. `build.py` also applies a number of exact-string patches to the base file; if you edit the base, the build will tell you which patch no longer matches.

## Build
```
python3 build.py            # writes dist/Poly-Tourismo.html
```
No bundler needed; Python 3 only.

## Tests
The scripts in `tests/` drive the built game headlessly (AI lap sims, gear timing, pit stops, traffic overlap, …).
```
npm install                 # three@0.128.0, served locally to the test browser
pip install playwright && playwright install chromium
python3 tests/lap_sim_all_tracks.py merc
python3 tests/gear_durations.py
```
Medal times are derived from an AI Mercedes lap (`P.MEDAL_REF` in `src/layers/modes.js`); re-measure with `lap_sim_all_tracks.py` and `lap_sim_reverse.py` after changing physics, gearing or tracks.

## Cheats (in Brand Central)
Typing `hakanwantsall` unlocks every car, `hakannowant` resets to the starter car.

## Assets & licence
The car models come from low-poly car packs; confirm the licence of each pack before publishing this repository publicly, and add a `LICENSE` file for your own code.
