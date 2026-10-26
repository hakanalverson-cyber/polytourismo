/* ===== Poly GT layer: update log (menu button + overlay) ===== */
(function ptUpdateLog(){
'use strict';
const P=window.PT8;
P.LOG=[
 {v:'0.12',d:'Oct 25, 2026',t:'New Road Atlanta and Imola scenery, smarter CPU, gearbox choice',items:[
  'Real cornering on Imola and Road Atlanta: full steering lock gives the tightest turn the tyres can hold, about 1.3 g (more for grippy cars, less on gravel), so a 40 mph corner is no longer taken at 100. Holding full lock never costs speed (the first version scrubbed speed and understeered badly). Cars there are 12% quicker than stock (was 30%).',
  'CPU cars on Imola and Road Atlanta are quicker: they brake later and corner harder (Road Atlanta CPU lap 117 s, Imola 126 s). Gold times re-measured.',
  'CPU cars keep their own grid lane off the start and ease onto the racing line over the next 250 m, instead of all swerving to one side. After the finish the autopilot keeps your car in its lane.',
  'Grid cars stand behind the painted line of their box, not on top of it.',
  'Rolling start is automatic: every car, yours too, is on autopilot in its own lane at about 100 km/h, and you get control the moment the leader takes the green flag at the line.',
  'The chase camera no longer jitters on hills (its height trailed the car on climbs and wobbled with the frame rate). A camera that ends up inside the car behind no longer fills the screen with it.',
  'The hood camera under bridges switches earlier (about 1.7 s ahead) and blends in and out more slowly.',
  'Car-to-car contact uses boxes the size of the drawn cars (the big cars on the model tracks used a 5.8 m circle), with a softer bounce, so one knock is one hit.',
  'Race messages (yellow) are in the pixel font. Player name tags are retro pixel plates and are hidden on your own screen.',
  'Results show the winning car. Pause is on Tab (Escape no longer flashes the pause menu when held).',
  'The Track race setup page is laid out exactly like Quick Play (same plain option rows, same width; no boxed panel).',
  'Track races pick cars on the setup page like Quick Play (name, gearbox, Garage button per driver); options line up in one column. The Track and Rally garages have an OWNED section: your own garage cars, usable there too.',
  'Cars on Imola and Road Atlanta are 30% quicker in every respect (top speed, acceleration, braking and grip), so the big full-size tracks feel fast. Camera shake removed; speed streaks much fainter. Track mode opens on the Race format.',
  'A track file saved in the browser can no longer replace a newer built-in one (an old saved Road Atlanta was bringing the coned route back); stale saved copies are deleted.',
  'Road Atlanta follows the real circuit: the lap line used to run through three side loops the model closes off with cones (so driving the real road counted as leaving the track and blew the car up). Every coned road is now shut out of the lap.',
  'Road Atlanta in proper colour: the model ships olive grass, brown asphalt and dull trees; they are now graded to clear greens and greys like Imola.',
  'Cars on Imola and Road Atlanta are 1.8x (was 1.6x) and start in the grid boxes painted on the model. The chase camera sits closer and lower there, widens at speed, shakes lightly and shows speed streaks, so speed reads properly with the bigger cars.',
  'The hood camera only takes over under a bridge or other structure over the road (Imola has one bridge; the old hand-built tunnels are gone).',
  'Track mode has a Format option: Time trial (drivers take turns, as before) or Race: 1-4 drivers on split screen, up to 7 CPU drivers with level and class, standing or rolling start, grid order drawn at random. Rolling start: the field forms up behind the leader at about 100 km/h and goes green at the line.',
  'Handbrake removed.',
  'Imola and Road Atlanta are now the cartoon track models Hakan bought, at their full size (Imola 3.9 km, Road Atlanta 4.0 km): each model\'s own road, kerbs, run-offs, gravel, grandstands, pit buildings, start gantry, trees, tyre walls and banners. The car drives on the model\'s real surfaces (heights, gravel and paved run-off), and the walls follow its barriers. On these two tracks the cars are drawn 1.6x bigger so they match the buildings; the chase camera, wall contact and car-to-car contact grow with them. Medal times reset from CPU laps.',
  'Fixed thin tears in the road on the model tracks (neighbouring road tiles were rounded to slightly different heights) and gave the model textures back their colour.',
  'The old hand-built Road Atlanta and Imola are deleted. Those two circuits now only appear once their track file is loaded (built into the full download and the online version).',
  'Track files: under the circuit list there is an Add track file row. Pick a .ptrack file and that track replaces its circuit and is remembered by this browser. The full download has Imola and Road Atlanta built in; the small download is light enough to email, with the two tracks as separate files.',
  'Fixed the car jumping on downhills (worst at the Nürburgring): at the joins between road pieces on the outside of a bend the game briefly read the ground about 1 m above the road and bounced the car off it. A CPU lap of the Nürburgring now has 0 airborne moments (was 4, up to 2 m); Road Atlanta and Imola stay at 0.',
  'Road Atlanta rebuilt to feel like a real circuit, the way the Nordschleife does: worn grey tarmac, Armco rails close on both sides (swung back behind the red clay run-offs), white concrete walls with catch fencing on the straights, and tall loblolly pine and oak woods right up behind the barriers. A proper pit building with garages, a glazed upper floor and a tarmac pit lane, darker grandstands with crowds, steel gantry legs. The random boxes and flags are gone.',
  'Imola checked against the survey from the driver seat at 32 points round the lap: kerbs in the real colours (pale blue-white strip, green band with white triangles, red edge), gravel in grey-beige pebbles with clean edges, olive green walls, green trees, tyre walls only against a barrier, no barrier stubs at the chicanes, and the thin dark asphalt strips along the edges replaced by the pale blue painted strips where the real track has them.',
  'Imola buildings redone as proper low-poly models at the survey positions: the pit building (garages with red posts, navy balcony, offices and rooftop pavilions), the angled paddock block, the red end block and the striped control tower are modelled by hand; every other building has floors of windows, houses have pitched roofs, covered grandstands stand on legs under their roofs, plus tents, vans, trucks and boards. The blocky pillars, slabs and black tyre rubble are gone, and barriers never cross the road. Gravel traps, kerbs and run-offs follow the survey outlines; the road follows the real white lines (CPU lap about 3 s slower, medal times adjusted). Far tree trunks are brown again.',
  'Imola: no asphalt strip outside the white line any more (grass meets the line; kerbs stay at the corners), and gravel only on the outside of corners, as at the real track.',
  'Imola gravel traps start right at the road edge (or the outside of the kerb), with no strip of grass in between.',
  'Imola gravel traps: always on top of the grass (no more grass showing through), unbroken from end to end with smooth edges, and the slow-down zone matches the gravel you see. Green run-off never lies over the gravel. The painted starting grid boxes are gone.',
  'Imola trackside, closer to the real circuit: no tree reaches over the road, the gravel, the run-off or a barrier; tyre walls only ever stand against a wall or Armco; the real wall and gravel are back along the start straight (the grandstands sit behind them); woods fill the land from behind the barriers out into the haze, the real buildings around the circuit are in, with windows, and the town lies beyond the start straight.',
  'Imola: the straights are dead straight now (no more kinks), green walls and catch fences run unbroken instead of splitting into pieces, and the pit lane narrows and runs into the track at both ends with a crash-cushion nose on the pit wall instead of stopping in the grass. The garage block has closed end walls.',
  'Imola rebuilt from a survey of the real circuit: every green wall, Armco run, catch fence, tyre wall, gravel trap and green run-off now stands where it does at the real track, with 11,000 trees, the grandstands and the footbridges placed where the real ones are. The road was recentred on the real line (it had drifted up to 5 m in places), and the pits moved to the right of the start straight, as at the real circuit. The start straight has an unbroken run of grandstands behind a green wall and fence, opposite the pits. Grandstands everywhere sit square to the road, well behind the barriers, on solid ground. All models and textures are our own; the red and white race control tower and the tricolour kerbs stay.',
  'No street lights on the real circuits. Deeper, less washed-out grass on both. Kerbs run unbroken through every corner, and sand traps and run-offs sit on the ground as drawn, so grass no longer pokes through them.',
  'CPU cars can no longer pass through tunnel walls, barriers or anything else the player hits. They now follow a proper racing line (outside, apex, outside) worked out for each track, and plan corner speeds from it: Road Atlanta CPU lap 112.5 s to 104 s, with no crashes on any track. Medal times were adjusted to match.',
  'No more random hops: the suspension read a kerb lip or the step from road to grass as the ground shooting upward and threw the car into the air. It now measures the slope over a few metres (Road Atlanta CPU lap: 11 hops to none).',
  'Cars keep their grip going downhill: the suspension used to read a falling road as the car lifting off, so the tyres went light on every descent. Now it follows the ground under the car.',
  'The ground meets the edge of the track flush on every map: no more grey wall or step beside the asphalt.',
  'Choose Manual or Automatic as the first step when you enter Rally or Track. The automatic gearbox shifts in the power band, holds a gear briefly after each shift, never shifts in mid-air, and kicks down when you floor it.',
  'Gravel is looser for cars that are weak on it: 50% less grip for weak cars, 25% for neutral ones and 10% for strong ones. The car card shows the real figure.',
  'Multiplayer with damage on: every player gets their own damage readout beside their HUD.',
  'Brand Central: buying a car plays the full showcase sequence again.',
  'Menus: the car strip scrollbar no longer pushes the cards up, and the yellow accents on tabs, maker cards and highlights are now white. Hovering a brand in Brand Central uses the same light grey as the mode tabs instead of blue.']},
 {v:'0.11',d:'Oct 25, 2026',t:'Smoother ride, cleaner scenery, faster',items:[
  'No more jitter on hills: the drawn body no longer bobs as the road climbs and falls. The ride-height drop is measured once per car instead of every frame, the anti-clipping lift is capped and eased, and the real elevation data is smoothed.',
  'Nordschleife: the pale green walls behind the trees are gone. About 380 m from the road the ground used to jump up to the lap\'s average height, a 150 m cliff beside the low valleys. It now eases out gently, and the wooded slopes beyond the tree line carry distant forest.',
  'Nordschleife: the Karussell concrete fades in and out instead of starting on a hard straight line, and the corner-name boards that cut through the Armco are gone.',
  'The pause menu now hides every other piece of UI: dash, stage panel, now-playing card, prompts and the FPS counter.',
  'Performance on every track: sun shadows use cheaper filtering, the ground is no longer re-drawn into the shadow map, and hundreds of separate trackside props are merged into a few draws (Quick Play: 339 to 186 draw calls per frame). Higher graphics settings should hold their frame rate much better.']},
 {v:'0.10',d:'Oct 24, 2026',t:'Grip, ride height, trees and props',items:[
  'Grip fixed on every track: the car no longer slides when you tap the steering. The drift mode used to switch itself on with every quick steering tap above 47 mph, cutting sideways grip to a quarter; now it only engages while you hold the handbrake. Tarmac grip is also firmer for the player, so the car goes where it is pointed. Gravel, grass and ice keep their loose feel.',
  'Cars sit on the road: every car was riding 6 to 10 cm above the surface. The body now settles so the tyres touch the ground under them, on every track.',
  'Nothing floats: on every map, trees and props are now set onto the ground as it is actually drawn (the drawn ground is a triangle grid that differs from the smooth height used for placement by up to a metre on slopes).',
  'Fewer, tidier trees on Road Atlanta, Imola and the Nordschleife: every tree keeps a clear space around it so crowns never stack, with fewer rows and clumps. The painted forest backdrop sits further back, lower and in shade, so it adds depth without reading as a wall.',
  'New simple props instead of plain boxes: grandstands with stepped seat rows and a roof, pit garages with roller doors, paddock cabins with windows and awnings, a race-control tower with a glass cab, marshal huts with pitched roofs, gazebos and shaped camper vans.']},
 {v:'0.09',d:'Oct 24, 2026',t:'New track: the Nordschleife',items:[
  'The Nurburgring Nordschleife is a new circuit-mode track and by far the longest in the game: a 20.8 km lap with about 290 m of climb, from Hatzenbach, Flugplatz and Aremberg down to Breidscheid, up through Kesselchen to the banked Karussell, round Brunnchen and Pflanzgarten and back along the Dottinger Hohe. The layout was rebuilt from the real corner sequence and lap length, not from a surveyed map, so it is close to the real track but not exact.',
  'Armco on both sides of the whole lap, kerbs on every corner, gravel traps and tyre walls at the slowest corners, dense Eifel forest, spectator camps at the famous corners, corner name boards and km boards, bridges, the T13 grandstand and Nurburg castle on its hill.',
  'No lag on the long lap: the landscape is built in tiles a few milliseconds at a time around the camera and dropped again behind you, and distant scenery is thinned and culled. Medal times were calibrated with the same rule as Road Atlanta and Imola.',
  'Nordschleife layout re-traced from a real layout map: the swoops, the Karussell hook and the long Doettinger Hoehe diagonal are where they belong. (Since replaced by the OSM trace, below.)',
  'Lusher Eifel forest: trees right up to the verge, a painted forest backdrop on two layers behind them for depth, richer greens. Tyre walls are one solid wall of touching tyres, the plain white boxes are now camper vans, concrete walls line the main straight.',
  'Nordschleife clearings look like the real thing: grassy banks, catch fencing at the famous spots and fan writing on the asphalt. The forest backdrop has a tree-canopy outline and no hard edge, and the grandstands are gone.',
  'Backgrounds on all three circuits: tidy tree lines with undergrowth along the foot, set at a steady distance and wandering naturally in and out; openings only where they are meant to be (the clearings and the start area) with clean edges; the painted canopy sits further back and fades out instead of cutting off. Road Atlanta gets Georgia pine woods and Imola Romagna parkland with poplars and umbrella pines, both with painted hills on the horizon instead of the grey stands. Kerbs ride on the road surface, the ground meets the road edge flush, and deer, stags, foxes, cows and horses graze beside the tracks.',
  'Nordschleife forest is solid all the way round: no random bare patches, trees and the canopy backdrop come right up behind the Armco, and only the real open spots (Flugplatz, Quiddelbacher Hoehe, Doettinger Hoehe, Antoniusbuche) have smaller clearings.',
  'Road Atlanta, Imola and the Nordschleife: no pyramid hills, roofs or tents anywhere; no centre line; red/white kerbs only at the corners instead of a grey strip round the whole lap.',
  'Real data this time. Layouts: the Nordschleife now follows the OpenStreetMap trace of the circuit (open-racetrack-db, ODbL); the old hand-trace was up to 150 m off in places. Elevation for all three tracks is sampled from the AWS Terrain Tiles elevation model along those OSM lines and lightly smoothed: the Nordschleife spans 340 m at Breidscheid to 628 m near Hohe Acht (published relief about 290 m), with grades capped at the published maxima of 18 % up and 11 % down; Road Atlanta spans 35 m with T1 at the bottom of the hill and the dive at T12; Imola spans 33 m up to Piratella and the Variante Alta. On Road Atlanta and Imola the sharpest crests are softened slightly (by up to about 5 m) so cars stay planted over them, and the exaggerated road banking was cut back to near flat. Corner names were re-placed by distance and curvature. Medal times re-checked.',
  'New trees on all three circuits: real low-poly spruces, pines, broadleaves and bushes from the Quaternius Ultimate Nature pack (CC0), instead of the cone-and-ball trees.',
  'Quick Play (Quick Race, Time Attack, Elimination, Cut-Up, Versus) has the 10 original maps; Road Atlanta, Imola and the Nordschleife are exclusive to Track mode.',
  'Track previews are white with numbered corners tinted by how tight they are. The Now Playing card sits in the bottom-right corner.',
  'Results screen is minimal and the same in every mode: position, driver with the car underneath, best lap and time, with your row highlighted. No coloured chips or blocks.']},
 {v:'0.08',d:'Oct 24, 2026',t:'Tracks, menus and Brand Central',items:[
  'The original maps are back in the track picker for Quick Race, Time Attack, Elimination, Cut-Up and Versus, alongside Road Atlanta and Imola. Track mode still has only the circuit tracks and Rally only the stages.',
  'Road Atlanta and Imola were re-traced from real layout maps and sized to their real lap lengths (4,088 m and 4,909 m, 1 unit = 1 m), with real-scale widths and roughly real elevation. Medal times were recalibrated. The sky and distant hills now follow the camera on big tracks.',
  'Brand Central cards and the Quickplay drop-down use the garage card look with a white outline on the selected one. The menu footer shows cars owned. Imola is 1.6x longer.',
  'Results screen redone: bigger standings with square row ends, a larger player row, a render of your car, and payouts beside it. The menu drop-down now lines up flush with its tab.',
  'Regular modes now use the track-style maps (Road Atlanta and Imola); the old quickplay maps are out of the picker for now. Grid boxes line up exactly with where the cars spawn.',
  'Brand Central: cars now drive up into the showroom with spinning wheels. Buying a car fades to black, shows its stats, and an Add to garage button brings you back as the car drives in from the side.',
  'Results are a Gran Turismo style table with rows sliding in. The main menu is a top tab bar with a Quickplay drop-down (Quick Race, Time Attack, Elimination, Cut-Up, Versus); Free Roam is parked for now.',
  'Brand Central is a black showroom: car on the left, specs and price on the right, Back bottom left, Buy bottom right, arrows to flip cars and an All cars list. Sharp corners and a calmer upright font everywhere.',
  'Brand Central lists cars by manufacturer: pick a maker (with its logo), then browse the cars from that maker as a card strip with Back and Buy buttons. Logos are CC0 vector marks from Simple Icons plus logo image files from the car-logos-dataset project; the two makers without a file (Shelby, Tommy Kaira) get an initials badge.',
  'Class fixes: the RS4 Avant and a few other class B cars had class D top speeds and now match their class. Lighter default shadows and a lower pixel-density cap for better frame rates; adaptive resolution reacts faster.']},
 {v:'0.07',d:'Oct 24, 2026',t:'New track: Imola',items:[
  'Imola is a new circuit-mode track: the real Grand Prix layout, shrunk to about a third and with the tightest chicanes opened up, so a lap is short and busy. Only the road layout was used, the rest is built from scratch in the Poly GT low-poly look.',
  'Real race track furniture: red and white kerbs on every corner, raked sand traps on the outside of each corner that really bog you down, painted tyre walls at the sharpest corners, guardrails, pit wall and pit garages, a control tower, grandstands, a footbridge, grid boxes, corner boards and marshal posts.',
  'Performance: dense forests now thin out with distance, and the night city uses fewer dynamic lights.']},
 {v:'0.06',d:'Oct 21, 2026',t:'Free Roam makeover',items:[
  'The whole Free Roam map is rebuilt from open-source (CC0) models: a model-built town with towers, shops, houses and a park fountain; roadside villages, farms with barns, silos, crop plots and tractors; a wind farm, camp, harbour and roadside diners.',
  'New roads: a north bypass, a south coast road, a west coast road and dirt lanes to the farms. Rolling hills, patchwork fields, new tree and boulder models and a sky with drifting clouds.',
  'Cows, horses, deer and more graze near farms and in the meadows, and bolt when you drive too close.',
  'Your garage is now a closed room with a corner desk, TV lounge, workbench, tyres, rug, posters and a window onto the dusk.',
  'Stops are marked by a simple floating icon (a house for your garage) instead of the light beam.']},
 {v:'0.05',d:'Oct 21, 2026',t:'Free Roam',items:[
  'Career is now Free Roam: pick it and the screen fades to black, then you are dropped on your street in an open world about 6.7 km across, with a coast, a lake, a mountain pass, a forest, a town and an airfield.',
  'The world streams in chunks around your car and fades into distance haze, with a light blur at the edge of the view, so a big map stays smooth.',
  'Your garage is the house on your street and opens the same car viewer, now inside a garage. Brand Central, a tune shop (garage and tuning), a gas station and a race office are all in town; the race office holds the old career events and prizes.',
  'Make money with delivery jobs from the job board, drift scores at Drift Pier, speed traps around the island, airfield top-speed runs, the summit overlook and the car meet. M opens the map and lets you set a GPS marker.']},
 {v:'0.04',d:'Oct 20, 2026',t:'New track: Grand Valley',items:[
  'Harbor Lights is gone, replaced by Grand Valley, the first track of a brand-new roster: a short, low orange suspension bridge with two towers, hangers and cables, leading to a walled island city.',
  'City Island is built from the building pack and KayKit buildings: unbroken rows of buildings face every shore, corner towers, brick gate houses over both roads, shopfronts, trees, hydrants, bins and rooftop water towers. Any gap between buildings is a tiny alley with dumpsters, bins and crates; larger leftovers become pocket parks.',
  'Leave the city through the west gate and the race runs on into a forest valley: a winding, hilly gravel path (loose-surface grip) with real terrain, no rails, pine and broadleaf trees, bushes, boulders, logs, stumps, wild flowers, chevron boards on the sharp bends, and farm and camp sites with houses, barns, wells, haystacks and fences.',
  'The road swings round the valley and comes back to the start straight, with overhead signs, buoys and boats in the channel; the whole map works at dawn, day, sunset and night.',
  'Jumps can now have their own gap length and ramp height.']},
 {v:'0.03',d:'Oct 20, 2026',t:'New streetlights',items:[
  'All streetlights on every map: new lamp model, a much wider and softer pool of light, a smoother glow, and lights that fade in and out instead of popping.',
  'Only the rally mode has a loading screen now; everything else launches straight in. The loader car\'s front wheels point straight.',
  'Update log reset: everything before this is folded into 0.02.']},
 {v:'0.02',d:'Oct 20, 2026',t:'Everything so far',items:[
  'The game is now Poly GT, with an update log in the main menu and the tutorial under Settings > Driving.',
  'Leaderboard podium cards with animated blocks, a full table, and a title for each driver.',
  'Damage setting in every mode: sparks, smoke and debris on impacts, explosions at 100% and a respawn after 3 seconds.',
  'Per-player Manual / Auto gearbox; every car has its real gear count. Pit stops, fuel and tyre wear are gone.',
  'Perf points come from real stats and are capped at 1,500; every garage list runs low to high within each class.',
  'Reclassed cars (Diablo, Huracan, 458 and 599 GTB low class A, RS4 Avant upper class B, Zonda R renamed), higher-sitting track-only cars, 5% higher prices, about 8% more income.',
  'Stronger tuning that now costs credits (reset is free); new poses for the car photos; a 3-2-1 countdown when you resume.',
  'WRC is the Stratos, Delta, 037, Polo and Impreza WRX Rally (phenomenal on gravel); other rally cars are Casual (good on gravel). Rally and Track garage sections start closed.',
  'Career Cut-Up targets are lower (max 2,000). Every road surface now has the same steady grip.',
  'Smoother menus: black fades, lists pop in once, beeping ambience removed.',
  'Afterhours skyline rebuilt with the building pack.']}
];
const css=document.createElement('style');
css.textContent=`@keyframes ptFadeIn{from{opacity:0}}#ptLog{position:fixed;inset:0;z-index:8000;display:none;align-items:center;justify-content:center;background:#05070acc;backdrop-filter:blur(3px)}
#ptLog.on{display:flex;animation:ptFadeIn .25s ease both}
#ptLog .lgBox{width:min(720px,92vw);max-height:84vh;display:flex;flex-direction:column;background:linear-gradient(180deg,#121920,#0b0f13);border:1px solid #ffffff18;border-top:3px solid #f1f3f5}
#ptLog .lgHd{display:flex;align-items:center;padding:16px 22px;border-bottom:1px solid #ffffff12}
#ptLog .lgHd h2{margin:0;font:800 18px var(--mn);letter-spacing:.28em;font-style:italic}#ptLog .lgHd h2 em{color:#7fe3f2;font-style:italic}
#ptLog .lgHd span{margin-left:auto;font:700 10px var(--mn);letter-spacing:.2em;color:var(--dim)}
#ptLog .lgBody{overflow:auto;padding:6px 22px 18px}
#ptLog .lgV{padding:16px 0 4px;border-bottom:1px solid #ffffff0d}#ptLog .lgV:last-child{border:0}
#ptLog .lgV h3{margin:0 0 4px;font:800 15px var(--mn);letter-spacing:.14em;display:flex;gap:12px;align-items:baseline}
#ptLog .lgV h3 b{color:#f2c76b}#ptLog .lgV h3 small{font:600 10px var(--mn);letter-spacing:.18em;color:var(--dim)}
#ptLog .lgV h4{margin:0 0 8px;font:600 11px var(--mn);letter-spacing:.2em;color:#9fb0ba;text-transform:uppercase}
#ptLog ul{margin:0 0 12px;padding-left:18px}#ptLog li{margin:5px 0;font:500 13px/1.45 system-ui,sans-serif;color:#d7dde2}
#ptLog .lgFt{padding:12px 22px;border-top:1px solid #ffffff12;display:flex;justify-content:flex-end}`;
document.head.appendChild(css);
const ov=document.createElement('div');ov.id='ptLog';document.body.appendChild(ov);
const open=()=>{const cur=(document.querySelector('.menuTop small')||{}).textContent||'';
 ov.innerHTML=`<div class="lgBox"><div class="lgHd"><h2>UPDATE <em>LOG</em></h2><span>${cur}</span></div><div class="lgBody">`+P.LOG.map(e=>`<div class="lgV"><h3><b>v${e.v}</b><small>${e.d}</small></h3><h4>${e.t}</h4><ul>${e.items.map(i=>`<li>${i}</li>`).join('')}</ul></div>`).join('')+`</div><div class="lgFt"><button class="btn" id="lgClose"><span>Close</span></button></div></div>`;
 ov.classList.add('on');if(P.sfx)P.sfx('select');ov.querySelector('#lgClose').onclick=close};
const close=()=>{if(ov.classList.contains('on')){ov.classList.remove('on');if(P.sfx)P.sfx('back')}};
ov.addEventListener('click',e=>{if(e.target===ov)close()});
addEventListener('keydown',e=>{if(ov.classList.contains('on')&&(e.code==='Escape'||e.code==='Enter')){e.stopImmediatePropagation();e.preventDefault();close()}},true);
const ma=document.querySelector('.menuActions');
if(ma){const b=document.createElement('button');b.innerHTML=P.mi?P.mi('log','Update log'):'Update log';b.style.order=5;b.onclick=open;ma.append(b)}
P.openUpdateLog=open;
})();
