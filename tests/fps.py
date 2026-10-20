import sys,json
from playwright.sync_api import sync_playwright
from shot import ROOT,W
tr=sys.argv[1];cfgs=json.loads(sys.argv[2])
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-webgl'])
    pg=b.new_page(viewport={'width':1280,'height':720})
    def route(r):
        u=r.request.url
        if 'three.min.js' in u: r.fulfill(path=ROOT+'/node_modules/three/build/three.min.js',content_type='application/javascript')
        elif 'GLTFLoader' in u: r.fulfill(path=ROOT+'/node_modules/three/examples/js/loaders/GLTFLoader.js',content_type='application/javascript')
        else: r.abort()
    pg.route('**/*',lambda r: r.continue_() if r.request.url.startswith('file:') else route(r))
    pg.goto('file://'+W+'/Poly-Tourismo.html');pg.wait_for_timeout(2500)
    pg.evaluate("document.getElementById('play').click()");pg.wait_for_timeout(1000)
    pg.evaluate("PT8.launch({mode:'ta',track:%s,laps:2,humans:[{id:'merc',alt:0,name:'T'}],ai:[{id:'c29'},{id:'c44'},{id:'c66'}],tod:'day',endur:false})"%tr);pg.wait_for_timeout(9000)
    pg.evaluate("RACE.state='race'");pg.wait_for_timeout(1500)
    for name,js in cfgs.items():
        pg.evaluate(js);pg.wait_for_timeout(800)
        r=pg.evaluate("new Promise(res=>{let n=0,t0=performance.now();(function f(){n++;if(performance.now()-t0>5000)res(n*1000/(performance.now()-t0));else requestAnimationFrame(f)})()})")
        print(f"{name:28s} {r:6.1f} fps")
    b.close()
