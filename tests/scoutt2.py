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
    js="""(()=>{const T=RACE.T,sc=RACE.scene,a=T.tunnels[0][0],b=T.tunnels[0][1],o=[];sc.traverse(m=>{if(!m.isMesh||!m.geometry)return;m.geometry.computeBoundingBox();const bb=m.geometry.boundingBox;const cx=(bb.min.x+bb.max.x)/2,cz=(bb.min.z+bb.max.z)/2;const dd=Math.hypot(cx-T.x[(a+b)>>1],cz-T.z[(a+b)>>1]);const sz=new THREE.Vector3();bb.getSize(sz);if(dd<120&&sz.y<40&&m.material&&m.material.isMeshStandardMaterial&&m.material.side===THREE.DoubleSide)o.push(m.geometry.type+' col'+m.material.color.getHexString()+' em'+m.material.emissive.getHexString()+' sz'+sz.x.toFixed(0)+','+sz.y.toFixed(0)+','+sz.z.toFixed(0)+' vis'+m.visible+' par'+(m.parent&&m.parent.type))});return JSON.stringify(T.tunnels)+' '+o.join(' | ')})()"""
    print(pg.evaluate(js))
    print('\n'.join(logs[-8:]))
    b.close()
