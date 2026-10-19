from shot import run,W
import sys
def cam(name,ex,ey,ez,tx,ty,tz,fov=50,fog=1):
    return ('img',name,"""(()=>{const sc=RACE.scene,T=RACE.T;if(!window.__rr){window.__rr=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});window.__rr.setSize(1280,720);window.__rr.outputEncoding=THREE.sRGBEncoding}
const c=new THREE.PerspectiveCamera(%d,1280/720,1,6000);const f=sc.fog;if(!%d)sc.fog=null;c.position.set(%s);c.lookAt(%s);window.__rr.render(sc,c);sc.fog=f;return window.__rr.domElement.toDataURL('image/png')})()""" % (fov,fog,'%s,%s,%s'%(ex,ey,ez),'%s,%s,%s'%(tx,ty,tz)))
st=[('wait',800),('js',"(()=>{PT8.launch({mode:'ta',track:14,laps:3,humans:[{id:'c0',alt:0}],ai:[]});for(let i=0;i<30;i++)step(1/60);const T=RACE.T;return JSON.stringify(T.bounds)})()")]
# centre of track ~ bounds centre
st+=[('js',"(()=>{const b=RACE.T.bounds;window.CX=(b[0]+b[1])/2;window.CZ=(b[2]+b[3])/2;return [CX,CZ].join()})()")]
for nm,ex,ey,ez,tx,ty,tz in [('over','CX-120','1650','CZ+1500','CX','0','CZ'),('top','CX','1900','CZ+1','CX','0','CZ')]:
    st+=[('img',nm,"""(()=>{const sc=RACE.scene;if(!window.__rr){window.__rr=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});window.__rr.setSize(1280,720);window.__rr.outputEncoding=THREE.sRGBEncoding}
const c=new THREE.PerspectiveCamera(42,1280/720,1,9000);const f=sc.fog;sc.fog=null;c.position.set(%s,%s,%s);c.lookAt(%s,%s,%s);window.__rr.render(sc,c);sc.fog=f;return window.__rr.domElement.toDataURL('image/png')})()"""%(ex,ey,ez,tx,ty,tz))]
run(W+'/Poly-Tourismo.html',st,'ra5')
