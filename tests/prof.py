import sys,json,os
from playwright.sync_api import sync_playwright
from shot import ROOT,W
tr=sys.argv[1]
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
    cdp=pg.context.new_cdp_session(pg);cdp.send('Profiler.enable');cdp.send('Profiler.start')
    pg.wait_for_timeout(6000)
    prof=cdp.send('Profiler.stop')['profile']
    nodes={n['id']:n for n in prof['nodes']};self={}
    dt=prof['timeDeltas'];tot=sum(dt)
    for s,d in zip(prof['samples'],dt):
        n=nodes[s];cf=n['callFrame'];k=cf['functionName']+' '+os.path.basename(cf['url'])+':'+str(cf['lineNumber']);self[k]=self.get(k,0)+d
    for k,v in sorted(self.items(),key=lambda x:-x[1])[:22]: print(f"{v/1000:8.0f} ms  {100*v/tot:5.1f}%  {k}")
    b.close()
