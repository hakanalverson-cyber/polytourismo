import sys
from shot import run,W
js="""(()=>{const names=%s;const cv=document.createElement('canvas');cv.width=1600;cv.height=900;cv.style.cssText='position:fixed;left:0;top:0;z-index:99999;width:1600px;height:900px';document.body.appendChild(cv);
const r=new THREE.WebGLRenderer({canvas:cv,antialias:true});r.setSize(1600,900,false);r.setClearColor(0xbfd4e6);const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(0xffffff,0x778899,.9));const dl=new THREE.DirectionalLight(0xffffff,.9);dl.position.set(-30,60,40);sc.add(dl);
const cols=Math.ceil(Math.sqrt(names.length*1.7)),rows=Math.ceil(names.length/cols);let i=0;
for(const n of names){const q=PT8.BLD[n];if(!q)continue;const m=new THREE.Mesh(q.g,PT8.PROPKIT.MAT);const cx=i%%cols,cz=Math.floor(i/cols);m.position.set(cx*22,0,cz*22);m.rotation.y=.6;sc.add(m);i++}
const cam=new THREE.PerspectiveCamera(32,16/9,1,800);cam.position.set(cols*11-11,cols*7+10,rows*22+cols*8);cam.lookAt(cols*11-11,2,rows*11-6);r.render(sc,cam);return names.length+' '+cols+'x'+rows})()"""%sys.argv[1]
run(W+'/Poly-Tourismo.html',[('wait',2500),('js',js),('shot','sheet')],'cs')
