import sys,base64
from playwright.sync_api import sync_playwright
import shot
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-webgl'])
    pg=b.new_page(viewport={'width':1280,'height':720})
    def route(r):
        u=r.request.url
        if 'three.min.js' in u: r.fulfill(path=shot.ROOT+'/node_modules/three/build/three.min.js',content_type='application/javascript')
        elif 'GLTFLoader' in u: r.fulfill(path=shot.ROOT+'/node_modules/three/examples/js/loaders/GLTFLoader.js',content_type='application/javascript')
        else: r.abort()
    pg.route('**/*',lambda r: r.continue_() if r.request.url.startswith('file:') else route(r))
    pg.goto('file://'+shot.W+'/Poly-Tourismo.html');pg.wait_for_timeout(2500)
    pg.evaluate("document.getElementById('play').click()");pg.wait_for_timeout(800)
    pg.evaluate("PT8.launch({mode:'ta',track:8,laps:1,humans:[{id:'merc',alt:0,name:'T'}],ai:[],tod:'day',endur:false})");pg.wait_for_timeout(7000)
    from PIL import Image
    import io
    def shotf(hide):
        js="""((hide)=>{const T=RACE.T,i=20,sc=RACE.scene,cam=new THREE.PerspectiveCamera(62,16/9,.3,1600);
        const c=Math.cos(T.psi[i]),s=Math.sin(T.psi[i]),l=T.hw[i]*.3,x=T.x[i]+c*l,z=T.z[i]-s*l,y=T.y[i]+2.6;
        cam.position.set(x,y,z);cam.rotation.order='YXZ';cam.rotation.y=T.psi[i]+Math.PI;cam.rotation.x=-.05;cam.updateMatrixWorld();
        const hid=[];sc.children.forEach(o=>{if(o.userData&&o.userData.ptProp&&new RegExp(hide).test(o.userData.ptProp)){o.visible=false;hid.push(o)}});
        RACE.cars.forEach(q=>{if(q.m)q.m.visible=false});R.setSize(1280,720,false);R.render(sc,cam);const d=R.domElement.toDataURL('image/png');hid.forEach(o=>o.visible=true);return d})(%r)"""%hide
        d=pg.evaluate(js);im=Image.open(io.BytesIO(base64.b64decode(d.split(',')[1]))).convert('RGB')
        return im.getpixel((763,230))
    print(pg.evaluate("""(()=>{const d=PT8.HP.defs.bld_A.parts[0].mat;const t=d.map;const im=t.image;const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d');g.drawImage(im,0,0);const a=g.getImageData(0,0,im.width,im.height).data;const out=[];for(let i=0;i<30;i++){const p=((i*37)%(im.width*im.height))*4;out.push([a[p],a[p+1],a[p+2],a[p+3]].join(','))}return JSON.stringify([im.width,im.height,t.flipY,t.encoding,d.color.getHexString(),d.vertexColors,out])})()"""))
    b.close()
