import sys
from shot import run,W
an="""(()=>{const w=RACE.cars[0].m.ptWheels[0];const o=[];const p=w.spin.children[0].geometry.attributes.position;for(let i=0;i<p.count;i++)o.push([p.getX(i),p.getY(i),p.getZ(i)].map(v=>+v.toFixed(3)));return JSON.stringify(o)})()"""
ids=sys.argv[1:]
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()")]
for i in ids:
    st+=[('wait',800),('js',"(()=>{PT8.launch({mode:'ta',track:0,laps:1,humans:[{id:'%s',alt:0,name:'T'}],ai:[],tod:'day',endur:false});return 1})()"%i),('wait',5000),('js',an)]
run(W+'/Poly-Tourismo.html',st,'wh3')
