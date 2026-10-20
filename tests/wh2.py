import sys,json
from shot import run,W
nm=sys.argv[1]
an="""(()=>{const c=RACE.cars[0].m;const out=[];for(const w of c.ptWheels||[]){const bins=new Array(24).fill(0);let x0=1e9,x1=-1e9,n=0;w.spin.children.forEach(ch=>{const p=ch.geometry.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),r=Math.hypot(y,z),a=Math.floor(((Math.atan2(z,y)+Math.PI)/(2*Math.PI))*24)%24;bins[a]=Math.max(bins[a],r);x0=Math.min(x0,x);x1=Math.max(x1,x);n++}});out.push('rad='+w.radius.toFixed(3)+' bins['+Math.min(...bins).toFixed(3)+'..'+Math.max(...bins).toFixed(3)+'] w='+(x1-x0).toFixed(2)+' pos='+w.pivot.position.x.toFixed(2)+','+w.pivot.position.y.toFixed(2)+','+w.pivot.position.z.toFixed(2)+' parts='+w.spin.children.length)}return RACE.cars[0].id+' '+(c.ptWheels?'':'NO WHEELS ')+out.join(' | ')})()"""
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',800),
('js',"(()=>{return PT8.CARS.filter(c=>/%s/i.test(c.name)).map(c=>c.id+' '+c.name+' m'+PT8.modelOf(c.id,0)).join(';')})()"%nm),
('js',"(()=>{document.getElementById('play').click();return 1})()")]
run(W+'/Poly-Tourismo.html',st,'wh')
