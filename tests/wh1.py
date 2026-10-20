import sys
from shot import run,W
js="""(()=>{const mi=%s;const car=PT8.CARS.find(c=>PT8.modelOf(c.id,0)===mi);return car?car.id:null})()"""%sys.argv[1]
an="""(()=>{const c=RACE.cars[0].m;const out=[];for(const w of c.ptWheels||[]){const bins=new Array(16).fill(0),xs=[1e9,-1e9];let cy=[0,0,0,0],cn=[0,0];w.spin.children.forEach(ch=>{const p=ch.geometry.attributes.position;for(let n=0;n<p.count;n++){const x=p.getX(n),y=p.getY(n),z=p.getZ(n),r=Math.hypot(y,z),a=Math.floor(((Math.atan2(z,y)+Math.PI)/(2*Math.PI))*16)%%16;bins[a]=Math.max(bins[a],r);xs[0]=Math.min(xs[0],x);xs[1]=Math.max(xs[1],x)}})
const mn=Math.min(...bins),mx=Math.max(...bins);out.push('r='+w.radius.toFixed(3)+' run='+(mx-mn).toFixed(3)+' w='+(xs[1]-xs[0]).toFixed(2)+' off='+w.pivot.position.x.toFixed(2)+','+w.pivot.position.y.toFixed(2)+','+w.pivot.position.z.toFixed(2)+' n='+w.spin.children.length)}return out.join('\\n')})()"""
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',800),('js',js)]
import json
run(W+'/Poly-Tourismo.html',st,'wh')
