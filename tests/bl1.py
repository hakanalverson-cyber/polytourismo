import sys
from shot import run,W
tr=sys.argv[1]
js="""(()=>{const L=RACE.scene.userData.props||[];const c={};L.forEach(p=>c[p.n]=(c[p.n]||0)+1);return JSON.stringify({c,err:RACE.scene.userData.propError||null})})()"""
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',1000),
('js',"(()=>{PT8.launch({mode:'ta',track:%s,laps:2,humans:[{id:'merc',alt:0,name:'T'}],ai:[],tod:'day',endur:false});return 1})()"%tr),('wait',8000),('js',js),
('js',"""(()=>{const L=RACE.scene.userData.props.filter(p=>/barn|farm|cabin|chalet|store|silo|ware|tower|block|shop|green|coop/.test(p.n));if(!L.length)return 'none';const p=L[0],c=RACE.cars[0];RACE.state='race';const a=Math.PI/4;c.x=p.x+Math.sin(a)*(p.fr+14);c.z=p.z+Math.cos(a)*(p.fr+14);c.y=p.y+4;c.vx=c.vy=c.vz=0;c.sp=0;c.yaw=a+Math.PI;return p.n})()"""),('wait',7000),('shot','a')]
run(W+'/Poly-Tourismo.html',st,'bl'+tr)
