import base64,sys
from shot import *
JS="""(async n0=>{const C=PT8.C10;while(!C.ready)await new Promise(r=>setTimeout(r,100));
const r=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true,alpha:true});const TW=260,TH=170,COL=6,ROW=6;r.setSize(TW,TH);
const sc=new THREE.Scene();sc.background=new THREE.Color(0x2a3038);sc.add(new THREE.HemisphereLight(0xffffff,0x555555,1.1));const dl=new THREE.DirectionalLight(0xffffff,1.1);dl.position.set(5,8,6);sc.add(dl);
const cam=new THREE.PerspectiveCamera(30,TW/TH,.1,100);
const cv=document.createElement('canvas');cv.width=TW*COL;cv.height=TH*ROW;const g=cv.getContext('2d');
for(let i=0;i<COL*ROW;i++){const k=n0+i;if(k>=C.n)break;const m=C.model(k,1).clone(true);const bb=new THREE.Box3().setFromObject(m),c=bb.getCenter(new THREE.Vector3()),s=bb.getSize(new THREE.Vector3());m.position.sub(c);const w=new THREE.Group();w.add(m);w.rotation.y=-.6;sc.add(w);
cam.position.set(0,s.y*.8+1.0,Math.max(s.x,s.z)*1.25+1.2);cam.lookAt(0,0,0);r.render(sc,cam);sc.remove(w);g.drawImage(r.domElement,(i%COL)*TW,((i/COL)|0)*TH);g.fillStyle='#fff';g.font='bold 18px sans-serif';g.fillText(k+'  '+C.meta[k].len.toFixed(1)+'m',(i%COL)*TW+6,((i/COL)|0)*TH+20)}
return cv.toDataURL('image/png')})(__N__)"""
N=int(sys.argv[1])
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-webgl'])
    pg=b.new_page(viewport={'width':1280,'height':720});logs=[];pg.on('console',lambda m:logs.append(m.text));pg.on('pageerror',lambda e:logs.append('ERR '+str(e)))
    def route(r):
        u=r.request.url
        if 'three.min.js' in u:r.fulfill(path=ROOT+'/node_modules/three/build/three.min.js',content_type='application/javascript')
        elif 'GLTFLoader' in u:r.fulfill(path=ROOT+'/node_modules/three/examples/js/loaders/GLTFLoader.js',content_type='application/javascript')
        else:r.abort()
    pg.route('**/*',lambda r:r.continue_() if r.request.url.startswith('file:') else route(r))
    pg.goto('file://'+W+'/Poly-Tourismo.html');pg.wait_for_timeout(3000)
    d=pg.evaluate(JS.replace("__N__",str(N)))
    open(OUT+'/sheet_%d.png'%N,'wb').write(base64.b64decode(d.split(',')[1]));print('\n'.join(logs[-8:]));b.close()
