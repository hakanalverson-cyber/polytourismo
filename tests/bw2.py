import sys,io,time
from playwright.sync_api import sync_playwright
from PIL import Image,ImageStat
import shot
tr=sys.argv[1];tod=sys.argv[2];dur=float(sys.argv[3])
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-webgl'])
    pg=b.new_page(viewport={'width':640,'height':360});logs=[]
    pg.on('pageerror',lambda e:logs.append('PAGEERROR '+str(e)))
    pg.on('console',lambda m:logs.append(m.type+': '+m.text) if m.type in('warning','error') else None)
    def route(r):
        u=r.request.url
        if 'three.min.js' in u: r.fulfill(path=shot.ROOT+'/node_modules/three/build/three.min.js',content_type='application/javascript')
        elif 'GLTFLoader' in u: r.fulfill(path=shot.ROOT+'/node_modules/three/examples/js/loaders/GLTFLoader.js',content_type='application/javascript')
        else: r.abort()
    pg.route('**/*',lambda r: r.continue_() if r.request.url.startswith('file:') else route(r))
    pg.goto('file://'+shot.W+'/Poly-Tourismo.html');pg.wait_for_timeout(2500)
    pg.evaluate("document.getElementById('play').click()");pg.wait_for_timeout(800)
    pg.evaluate("PT8.launch({mode:'ta',track:%s,laps:3,humans:[{id:'merc',alt:0,name:'T'}],ai:[],tod:'%s',endur:false})"%(tr,tod));pg.wait_for_timeout(6000)
    pg.evaluate("(()=>{const c=RACE.cars[0];c.forceAI=1;c.ai={skill:.9,lat:0,name:'T'}})()")
    t0=time.time();n=0;bad=[]
    while time.time()-t0<dur:
        im=Image.open(io.BytesIO(pg.screenshot())).convert('L');m=ImageStat.Stat(im).mean[0];n+=1
        if m<4:
            info=pg.evaluate("(()=>{const c=RACE.cars[0];return JSON.stringify({st:RACE.state,idx:c.idx|0,sp:Math.round(c.sp||0),t:RACE.t&&RACE.t.toFixed?RACE.t.toFixed(1):0,dead:!!c.dead,ghost:!!RACE.ghost})})()")
            bad.append((round(time.time()-t0,1),round(m,1),info))
    print('frames',n,'black',len(bad));[print(x) for x in bad[:20]];print('\n'.join(logs[-10:]))
    b.close()
