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
    js="""(()=>{const sc=RACE.scene,u=sc.userData,pm=u.lampPool;let err='';try{updateVisual(RACE.cars[0],RACE.T,0)}catch(e){err=String(e)};return err+' '+ JSON.stringify({lamps:u.lampPos&&u.lampPos.length,vis:u.lamps&&u.lamps.visible,pool:!!pm,verts:pm&&pm.geometry.attributes.position.count,col:pm&&pm.material.color.getHex(),first:u.lampPos&&u.lampPos[0],car:[RACE.cars[0].x,RACE.cars[0].z],lights:sc.children.filter(o=>o.isPointLight).map(l=>[l.intensity.toFixed(2),l.position.x.toFixed(0),l.position.z.toFixed(0)]),dbg:JSON.stringify(u.lampDbg).slice(0,300),have:(u.props||[]).filter(p=>p.n==='lamp').length})})()"""
    print(pg.evaluate(js))
    print('\n'.join(logs[-8:]))
    b.close()
