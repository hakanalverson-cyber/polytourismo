import sys,time
from playwright.sync_api import sync_playwright
import shot
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-webgl'])
    pg=b.new_page(viewport={'width':1280,'height':720})
    logs=[];pg.on('pageerror',lambda e:logs.append('PAGEERROR '+str(e)))
    pg.on('console',lambda m:logs.append(m.text) if m.type in('warning','error') else None)
    def route(r):
        u=r.request.url
        if 'three.min.js' in u: r.fulfill(path=shot.ROOT+'/node_modules/three/build/three.min.js',content_type='application/javascript')
        elif 'GLTFLoader' in u: r.fulfill(path=shot.ROOT+'/node_modules/three/examples/js/loaders/GLTFLoader.js',content_type='application/javascript')
        else: r.abort()
    pg.route('**/*',lambda r: r.continue_() if r.request.url.startswith('file:') else route(r))
    pg.goto('file://'+shot.W+'/Poly-Tourismo.html');pg.wait_for_timeout(2500)
    pg.evaluate("document.getElementById('play').click()");pg.wait_for_timeout(800)
    pg.evaluate("PT8.launch({mode:'ta',track:8,laps:2,humans:[{id:'merc',alt:0,name:'T'}],ai:[],tod:'day',endur:false})");pg.wait_for_timeout(5000)
    # step the sim quickly with AI driving, snapshot at given idx offsets
    targets=[int(x) for x in sys.argv[1].split(',')]
    pg.evaluate("(()=>{const c=RACE.cars[0];c.forceAI=1;c.ai={skill:1,lat:0,name:'T'};window.__st=()=>{for(let i=0;i<3;i++)step(1/60)}})()")
    for t in targets:
        for _ in range(4000):
            idx=pg.evaluate("(()=>{for(let i=0;i<20;i++)step(1/60);return RACE.cars[0].unw})()")
            if idx>=t: break
        pg.wait_for_timeout(250)
        pg.screenshot(path=shot.OUT+'/dr_%d.png'%t)
    print('\n'.join(logs[-6:]))
    b.close()
