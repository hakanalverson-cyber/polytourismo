import sys,base64,json
from playwright.sync_api import sync_playwright
import shot
tr=sys.argv[1];tod=sys.argv[2];tag=sys.argv[4]
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
    pg.evaluate("PT8.launch({mode:'ta',track:%s,laps:1,humans:[{id:'merc',alt:0,name:'T'}],ai:[],tod:'%s',endur:false})"%(tr,tod));pg.wait_for_timeout(7000)
    cams=json.loads(sys.argv[5])
    for ci,(px,py,pz,tx,ty,tz) in enumerate(cams):
        js="""(()=>{const sc=RACE.scene,cam=new THREE.PerspectiveCamera(60,16/9,.5,1600);cam.position.set(%s,%s,%s);cam.lookAt(%s,%s,%s);cam.updateMatrixWorld();RACE.cars.forEach(q=>{if(q.m)q.m.visible=false});R.setSize(1280,720,false);R.render(sc,cam);return R.domElement.toDataURL('image/png')})()"""%(px,py,pz,tx,ty,tz)
        d=pg.evaluate(js);open(shot.OUT+'/%s_%d.png'%(tag,ci),'wb').write(base64.b64decode(d.split(',')[1]))
    print('\n'.join(logs[-8:]))
    b.close()
