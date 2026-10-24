# Poly GT — handoff (everything needed to continue)

Repo: https://github.com/hakanalverson-cyber/polytourismo (all work is pushed). Last session: https://claude.ai/code/session_01L31GiD6Zd1BxGLAKRJoJeZ
Live in-app Artifact (lite build, kept updated): https://claude.ai/artifact/SN7M37MyXUiy9w1P5JygQG (Version 28)

## What it is
Single-file Three.js r128 low-poly racing game. `python3 build.py` -> `dist/Poly-Tourismo.html` (~33 MB). `LITE=1 python3 build.py` -> ~17.5 MB (emailable; the user's school blocks downloads).
Needs: `npm install` (three@0.128 in node_modules, used by tests), Python 3 with Pillow/numpy/scipy/scikit-image (map tracing), Playwright + Chromium (tests).

## Standing rules from the user (keep following)
1. The game's name is **"Poly GT"** only. (Rename to include "low poly" is pending: I proposed Low Poly GT / Facet GT; user has not picked.)
2. Commit and push before sending. Commit trailers:
   `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` and `Claude-Session: https://claude.ai/code/session_01L31GiD6Zd1BxGLAKRJoJeZ`
3. Open-source / CC0 assets only. Never hand-draw trademarked logos; only embed existing logo files (Simple Icons CC0, MIT `car-logos-dataset`).
4. Honest, concise reports. Only existing cars. Big visual work one step at a time with screenshots.
5. Keep the Artifact updated and a lite build emailable. Deliver `/mnt/user-data/outputs/Poly-GT.html` and `Poly-GT-lite.html`.
6. Free Roam is parked: the user will upload a template file later; don't work on it.
7. After every change, attach the lite HTML in the chat reply (user asked: "from now on, put the lite html in chat").

## Shipping routine
```
LITE=1 python3 build.py ; cp dist/Poly-Tourismo.html /mnt/user-data/outputs/Poly-GT-lite.html
python3 build.py        ; cp dist/Poly-Tourismo.html /mnt/user-data/outputs/Poly-GT.html
node --check src/layers/<edited>.js          # an apostrophe in a single-quoted log string once broke the build
(cd tests && python3 errs.py)                # expect no page errors
rm -rf $A; python3 tools/pack_artifact.py dist/Poly-Tourismo.html $A   # A = scratchpad/art
git add -A; git commit ...; git push
Artifact publish $A/index.html with url=<artifact url> and files d00.txt..d11.txt
SendUserFile both outputs
```

## Architecture
- `build.py`: base HTML (`base/`) + exact-string `rep()` patches + concatenated layers `src/layers/*.js` (list near line 209) + `src/style.css` (appended; later rules win, many `!important`).
- Layers wrap base globals and share state on `window.PT8` (P). 1 game unit = 1 metre.
- UI: `src/layers/ui.js` (menus, Brand Central `#s8show`, results `#s8res/#resBox`, thumbnails `thumbFor`, `carBig`, `resLayout`), `rally.js` (rally/circuit sessions, finish screen), `modes.js` (race results, `P.showResults`), `logos.js` (maker logos, `P.LOGO`), `menuaudio.js`, `updatelog.js`, `perf.js` (R.render wrapper, chunking, `P.skyTrack` call).
- Tracks: `tracks.js` (`buildRally`: terrain grid, road ribbon, sky dome/pano/hills), `tracks3.js` + `ra_data.js` (Road Atlanta), `tracks4.js` + `imola_data.js` (Imola), `trackmode.js`, `stages.js`.
- Main menu: `#gtBar` tabs + `#gtDrop` drop-down; footer `.mfoot` (now shows Cars owned instead of Balance).
- Brand Central car view: maker list left, spec panel (transparent) top right, card strip full width at the bottom, Back lower-left, Buy lower-right. Cards and the Quickplay drop-down use the garage card look (white outline when selected).
- Results screen: two columns (standings left, car render + payouts right), square-ended rows, bigger player row.

## Tracks: current state (this is where we stopped)
- Road Atlanta and Imola were re-traced from two reference map images the user sent (generator: `tools/gen_maps.py`, takes the two PNGs). Data files are at real size: RA 4,088 m, Imola 4,909 m. Overlay check showed the cyan centreline on the real layouts. Maps are only ~250 px wide (6–9 m per pixel), so tight chicanes are smoothed; a higher-res map would tighten them. Elevation is approximate (RA old profile x1.5 ≈ 50 m; Imola 34 m from landmark anchors).
- Merc AI lap tests: RA 1:22.9, Imola 1:30.6, no crashes. `P.MEDAL_REF[14]=87.9` (trackmode.js), Imola 96 (tracks4.js).
- Sky dome, sun and distant panorama ride with the camera via `P.skyTrack` (needed because big tracks put the camera outside the old origin-centred 1500 m dome). Hill ring is centred on track bounds for big tracks.
- **Nordschleife: done (v0.09), track index `P.RING_IDX` (16).** Layout now traced from a layout map Hakan sent (233x216 px, not kept in the repo): `tools/trace_ring.py <map.png>` traces the inside edge of the black loop (keeps the Karussell hook), scales to 20,832 m, places corners by rough real distances and warps the old elevation/width profile onto them. The older turtle generator `tools/gen_ring.py` is superseded. Forest backdrop PNG: `tools/gen_forest_png.py` -> `src/layers/ring_forest.js`. Medal ref 480 (Merc AI 453.1 s). Track code `src/layers/tracks5.js`: own `buildRing` path (fast analytic `T.terr`, streamed 128 m terrain tiles within 640 m of the track built under a per-frame time budget in the R.render hook, Armco both sides, 16 sand traps, tyre walls, forest, Nürburg castle, bridges, km and corner boards, Eifel panorama). Merc AI lap 444.7 s, `P.MEDAL_REF[16]=471`. No street lamps on this track (`clean.js`).
- Results screen is now one minimal table for every mode (`P.lbHTML` in ui.js; rally/Track results use it too). CSS block `.lbm*` at the end of style.css.
- Node test harness: `BOOT=30000 node tests/shot.js tests/ringtour.json prefix` (steps wait/js/shot/key/click), since Python Playwright may be missing.

- **Real-data pass (v0.09, latest; supersedes the map-trace notes above).** Sources: open-racetrack-db (OSM traces, ODbL, github.com/open-racetrack-db) for the line, AWS Terrain Tiles (s3 elevation-tiles-prod, terrarium z15) for heights. `tools/dem_elev.py <ordb data> <tile cache> [--write|--relayout]` registers our line to OSM and samples the DEM (median 9 + gaussian 6 smoothing); `--relayout` replaced the Nordschleife layout with the OSM line itself (old trace was up to 151 m off). `tools/ring_marks.py` places corner names from published tourist-km values (nordschleife-erfahren.de, de.wikipedia) snapped to curvature peaks; `tools/grade_cap.py` caps grades at the published 18 % up / 11 % down. DEM ranges: ring 340–628 m asl, RA 272–309, Imola 39–72. Old `tools/real_elev.py` (guessed heights) deleted. Backup of the traced ring: not kept.
- **Trees:** Quaternius Ultimate Nature (CC0, via github.com/chibifire-stages/quaternius-stage) baked by `tools/tree_export.py <models dir>` (`tools/usda_mesh.py` reads the .usda, pyfqmr decimates to ~300 tris) into `src/layers/trees_q.js`, which also exposes `P.qTrees(parent,name,list,h,tints,o)` and `P.qMix`. Used by tracks3/4 (circuitWoods kinds + bushes) and tracks5 (ring forest).

- **v0.10 (grip, ride, snap, props):** `build.py` patches the drift entry so the drift mode needs the handbrake (`window.PT8_HB`, set in `src/layers/grip.js`); grip.js also gives the human player 1.4x tarmac side grip (AI excluded: with more grip its line control overshoots at Road Atlanta T2-T3, laps went 112 -> 144 s). `ride.js` drops each car's visible body so the lowest tyre touches the surface. `snap.js` (runs inside buildWorld, before perf chunking) moves ground-standing instances/props onto the drawn terrain triangle (grid meshes detected from geometry; ring uses `T.meshH` from tileSystem). `propkit.js` = P.kitStand/kitTent/kitVan/kitCabin/kitGarage/kitHut/kitTower/kitInstances used by tracks3/4/5. Tree spacing lives in trees_q.js `keep()` (crown radius per model, `r` in the baked data).

## Test harness (tests/)
`shot.py` `run(html, steps, prefix, size)` with steps `('wait',ms)`, `('js',code)`, `('shot',name)`; headless swiftshader is slow, first studio frame often black (wait >= 9 s). Useful: `errs.py`, `gtb.py` (Brand Central), `menu2.py`, `dd1.py` (drop-down), `res1.py` (results screen), `lapsim3.py <tracks>` (AI lap times; sets `RACE.state='race'` after the countdown), `im6.py` (start-line shots for Imola/RA), `len2.py` (track lengths), `rev.py`, `cls.py`. Launch a circuit race in tests with `PT8.launch({mode:'mp',rally:true,circuit:true,track:15,laps:2,humans:[{id:'merc',alt:0}],ai:[]})`.

## Other pending / notes
- Shelby and Tommy Kaira logos: no file found (user: fine). Hennessey: user wanted a symbol if one exists.
- Drive-in direction after buying a car (should come from the side) not fully re-verified.
- Music hint ("CLICK OR PRESS ANY KEY FOR MUSIC") is now bottom-centre so it can't cover Buy.
- `tests/out/` and `node_modules/` are not in the zip (regenerate).
