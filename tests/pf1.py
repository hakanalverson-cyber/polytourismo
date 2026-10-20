import sys
from shot import run,W
tr=sys.argv[1]
js="""(()=>{const out={};const r0=R.render.bind(R);let tr=0,n=0,cs=0,tri=0;R.render=function(s,c){const t=performance.now();const q=r0(s,c);tr+=performance.now()-t;n++;cs+=R.info.render.calls;tri+=R.info.render.triangles;return q};
window.__pf=()=>({render_ms:+(tr/Math.max(1,n)).toFixed(2),calls:Math.round(cs/Math.max(1,n)),tris:Math.round(tri/Math.max(1,n)),n,geo:R.info.memory.geometries,tex:R.info.memory.textures,progs:R.info.programs.length});return 1})()"""
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',1000),
('js',"(()=>{PT8.launch({mode:'ta',track:%s,laps:2,humans:[{id:'merc',alt:0,name:'T'}],ai:[{id:'c29'},{id:'c44'},{id:'c66'}],tod:'day',endur:false});return 1})()"%tr),('wait',9000),('js',js),('js',"(()=>{RACE.state='race';return 1})()"),('wait',6000),('js',"JSON.stringify(window.__pf())")]
run(W+'/Poly-Tourismo.html',st,'pf')
