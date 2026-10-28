# Poly GT

A low-poly 3D racing game that ships as **one HTML file** (Three.js r128). Open `dist/Poly-Tourismo.html` in a browser and play.

## Modes
- **Time Attack** – chase medals and your own ghost lap (forward or reverse)
- **Local Multiplayer** – 1–4 humans plus CPUs, split-screen that merges when players are close
- **Cut-Up** – weave through traffic for score
- **Career** – earn Cr., buy cars in Brand Central, climb the class ranks D → S

7 tracks (4 tarmac incl. a night city, 3 gravel rally), 14 cars with 3-speed gearboxes (long, wide ratios), tyre wear, fuel and pit stops, slipstreaming, time of day, and an audio engine with per-car engine voices.

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

## v9 additions: scenery, ambience, tutorial
- `src/layers/props.js`: rooted props on all 10 maps. Each prop stands on measured terrain with a buried foundation/skirt, stacked items rest on each other, boats/buoys sit on the water plane, nothing on the road or inside existing scenery. `tests/props_check.py` raycasts every prop against the real ground mesh.
- `src/layers/ambience.js`: speed wind, surface rumble, per-map beds and wildlife/bells/horns, crowds at tents and the start line (follows the SFX volume and M mute).
- `src/layers/tutorial.js`: menu entry "Tutorial" plus a one-time first-run offer; guided lesson on the Quarry.

## Liveries (v9)
- Garage > pick a car > **Livery**. 16 patterns, 3 colours (body / accent / trim), 4 finishes, wheel colours, race number, 16 presets, Random and Stock. Saved per car and per colour variant (`SV.liv`).
- Rendering: each car's paint mesh gets baked car-frame coordinates (`aLp`/`aLn`); a generated 1024px canvas (top, right and left maps) is sampled in the paint shader, so one design fits all 28 models. Number text is mirrored on the left map so it reads correctly on both sides.
- CPU rivals get a random curated preset and race number each race.
- Starting grid is now random. Career events can pin the player with `ev.startPos`; `cfg.grid='fixed'` keeps the old order.


## Rally mode (v9)
A new **Rally** card (05; Career is now 06). One car is on the stage at a time and drivers take turns: pick 1-4 drivers, 1-3 stage laps, weather and time of day, then pass the controller between runs. Each driver uses their own key set (P1 WASD, P2 arrows, P3 IJKL, P4 TFGH), lowest total time wins, and everyone is paid by finishing position plus medals against the stage reference times (shared with Time Attack records).

Four brand-new stages (`src/layers/stages.js`), each with its own ground palette, scenery, props, backdrop and ambience:
- **Mangrove Ford** — tropical swamp, three water fords, palms, mangroves, stilt huts, reeds.
- **Terrace Run** — golden-hour vineyard switchbacks, cypress and olive groves, stone huts.
- **Ashfall Stage** — crater rim with a causeway that dives into the crater and U-turns, lava lake, vents, obsidian, falling ash and embers.
- **Autumn Ridge** — gold and red forest ridge, two stream fords, leaf fall, pumpkin patches, scarecrows.

Fords are real: the stream bed is carved into the terrain, the road dips through it, water slows the car (grip, top speed, acceleration, braking) and throws spray from every wheel, with a splash sound on entry and exit. Pace notes (`src/layers/rally.js`) call upcoming corners (grade 1-5 or hairpin), fords and jumps. Stage-wide effects: falling ash and rising embers/steam (Ashfall), leaf fall (Autumn), pollen (Terrace), fireflies (Mangrove).
Tests: `tests/stages_check.py` (geometry), `tests/stages_laps.py` (AI laps), `tests/rally_flow.py` (menu, turns, results), `tests/stg_*.py` (screenshots).

## Rally stages (v9)
- Rally uses only the four stages (Mangrove Ford, Terrace Run, Ashfall Stage, Autumn Ridge); they are hidden from every other mode, and Rally lists nothing else.
- Each stage is 6.4-6.9 km (about 3x a regular track), narrow and kinked, with water fords, a jump, and 6 checkpoints (gates, split banner with delta vs best/leader).
- Stage select shows a 3D render of the whole stage with route, checkpoints, fords and start marked.
- Prep stage: fade to the start line with cinematic cameras, nothing starts until Start stage / Enter.
- Replay after each run (chase / hood / TV / heli cameras, scrub, speed 0.25-4x).

### Rally controls and terrain (v9)
- Rally cars use real gearboxes (6-9 speeds, manual): `E` up / `Q` down, `Space` handbrake, `C` camera (chase, hood, bumper, far chase). Everyone uses these same keys because drivers take turns. Auto-shift in Settings still works.
- Softer suspension in Rally (body heave over dips, more roll).
- Stages have dips, crests and bumps, short pinch points (~4.4 m wide), mountains pushed clear of the roads, and the start line and checkpoints sit on straight, flat ground.
- Tutorial part 2 covers the rally controls; the briefing and prep screens list them per player.


## Cars (v10)
All 136 cars come from the *Low Poly Cars - Mega Pack* sheet. `tools/build_pack.py <glb>` splits the sheet into individual cars and writes
`assets/cars_v10.bin.gz` (quantised geometry), `cars_v10_tex.png` (shared palette) and `cars_v10.json` (sizes + body colour).
`src/layers/cars10.js` builds each model lazily: a `paint` mesh (plain colour, so liveries and the alt colour work) plus a palette-textured `body` mesh,
and generates the catalogue (category, class, stats, price). The 14 original ids keep their saves and stats but wear pack models.
Brand Central and the garage filter by category: hatchback, wagon, sedan, coupe, muscle, sports, supercar, hypercar and track.

## Versioning

The version lives in `VERSION` (shown in the main menu, on the title screen and in the update log). Hakan reset it to 0.01 on Oct 28, 2026; every major update raises it by 0.01 (bump `VERSION` and add a `{v:'0.0x',...}` entry at the top of `P.LOG` in `src/layers/updatelog.js`). Smaller fixes go into the current version's log entry. The builds before 0.01 are kept in the log as preview builds (`pre:` entries).
