import sys,base64,json
from playwright.sync_api import sync_playwright
import shot
tr=sys.argv[1];tod=sys.argv[2];pts=[int(x) for x in sys.argv[3].split(',')];tag=sys.argv[4] if len(sys.argv)>4 else 'sc'
fr=sys.argv[5] if len(sys.argv)>5 else 'road'
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
    js="""(()=>{const b=PT8.barnInfo(),sc=RACE.scene,cam=new THREE.PerspectiveCamera(60,16/9,.3,1600),d=40,h=17;
    cam.position.set(b.door.x+Math.sin(b.yaw)*d,b.y+h,b.door.z+Math.cos(b.yaw)*d);cam.lookAt(b.door.x,b.y+1.5,b.door.z);cam.updateMatrixWorld();
    R.setSize(1280,720,false);const gl=R.getContext(),px=new Uint8Array(4),rd=()=>{R.render(sc,cam);gl.readPixels(640,720-62,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);return px[0]+px[1]+px[2]};
    const base=rd(),res=[base];sc.children.forEach((o,i)=>{if(!o.visible)return;o.visible=false;const v=rd();o.visible=true;if(Math.abs(v-base)>60)res.push(i+':'+o.type+':'+(o.geometry?o.geometry.type:'')+':'+(o.material&&o.material.color?o.material.color.getHexString():'')+':'+(o.userData&&Object.keys(o.userData).join('|'))+' ->'+v)});return res.join(' ; ')})()"""
    print(pg.evaluate(js))
    print('\n'.join(logs[-8:]))
    b.close()
