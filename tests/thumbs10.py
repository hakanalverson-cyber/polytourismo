import json
from shot import *
JS="""(async()=>{const C=PT8.C10;while(!C.ready)await new Promise(r=>setTimeout(r,100));
const r=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});const TW=240,TH=140;r.setSize(TW,TH);
const sc=new THREE.Scene();sc.background=new THREE.Color(0x2a3038);sc.add(new THREE.HemisphereLight(0xffffff,0x555555,1.1));const dl=new THREE.DirectionalLight(0xffffff,1.1);dl.position.set(5,8,6);sc.add(dl);
const cam=new THREE.PerspectiveCamera(30,TW/TH,.1,100);const out=[];
for(let k=0;k<C.n;k++){const m=C.model(k,0).clone(true);const bb=new THREE.Box3().setFromObject(m),c=bb.getCenter(new THREE.Vector3()),s=bb.getSize(new THREE.Vector3());m.position.sub(c);const w=new THREE.Group();w.add(m);w.rotation.y=2.55;sc.add(w);
cam.position.set(0,s.y*.8+.9,Math.max(s.x,s.z)*1.2+1.1);cam.lookAt(0,0,0);r.render(sc,cam);sc.remove(w);out.push(r.domElement.toDataURL('image/jpeg',.72))}
return JSON.stringify({thumbs:out,cats:PT8.CARS.reduce((a,c)=>{a[c.k10]=[c.name,c.cat,c.id];return a},{})})})()"""
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-webgl'])
    pg=b.new_page(viewport={'width':1280,'height':720})
    def route(r):
        u=r.request.url
        if 'three.min.js' in u:r.fulfill(path=ROOT+'/node_modules/three/build/three.min.js',content_type='application/javascript')
        elif 'GLTFLoader' in u:r.fulfill(path=ROOT+'/node_modules/three/examples/js/loaders/GLTFLoader.js',content_type='application/javascript')
        else:r.abort()
    pg.route('**/*',lambda r:r.continue_() if r.request.url.startswith('file:') else route(r))
    pg.goto('file://'+W+'/Poly-Tourismo.html');pg.wait_for_timeout(3000)
    open('/home/claude/work/thumbs.json','w').write(pg.evaluate(JS));b.close()
