import sys
from shot import run,W
an="""(()=>{const out=[];for(const w of RACE.cars[0].m.ptWheels){let st=[];const rg=new Array(24).fill(0).map(()=>[9,0]);w.spin.children.forEach(ch=>{const p=ch.geometry.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i),z=p.getZ(i),r=Math.hypot(y,z);if(r<.3)continue;const k=Math.min(23,Math.floor((Math.atan2(z,y)+Math.PI)/(Math.PI*2)*24));rg[k][0]=Math.min(rg[k][0],r);rg[k][1]=Math.max(rg[k][1],r)}});out.push(rg.map(v=>v[1].toFixed(2)).join(' '))}return out.join('\\n')})()"""
ids=sys.argv[1:]
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()")]
for i in ids:
    st+=[('wait',800),('js',"(()=>{PT8.launch({mode:'ta',track:0,laps:1,humans:[{id:'%s',alt:0,name:'T'}],ai:[],tod:'day',endur:false});return 1})()"%i),('wait',5000),('js',an)]
run(W+'/Poly-Tourismo.html',st,'wh3')
