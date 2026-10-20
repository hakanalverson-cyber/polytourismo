import base64
from shot import run,W,OUT
js="""(()=>{PT8.launch({mode:'ta',track:8,laps:1,humans:[{id:'merc',alt:0}],ai:[],rev:true});const T=RACE.T;const sc=RACE.scene,cam=new THREE.PerspectiveCamera(60,16/9,.5,1800);cam.position.set(-470,36,40);cam.lookAt(-330,16,30);cam.updateMatrixWorld();R.setSize(1280,720,false);R.render(sc,cam);return R.domElement.toDataURL('image/png')})()"""
import sys
from playwright.sync_api import sync_playwright
import shot
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-webgl'])
    pg=b.new_page(viewport={'width':1280,'height':720});logs=[];pg.on('pageerror',lambda e:logs.append(str(e)))
    def route(r):
        u=r.request.url
        if 'three.min.js' in u: r.fulfill(path=shot.ROOT+'/node_modules/three/build/three.min.js',content_type='application/javascript')
        elif 'GLTFLoader' in u: r.fulfill(path=shot.ROOT+'/node_modules/three/examples/js/loaders/GLTFLoader.js',content_type='application/javascript')
        else: r.abort()
    pg.route('**/*',lambda r: r.continue_() if r.request.url.startswith('file:') else route(r))
    pg.goto('file://'+shot.W+'/Poly-Tourismo.html');pg.wait_for_timeout(2500)
    pg.evaluate("document.getElementById('play').click()");pg.wait_for_timeout(800)
    d=pg.evaluate(js);open(OUT+'/rev8.png','wb').write(base64.b64decode(d.split(',')[1]));print(logs);b.close()
