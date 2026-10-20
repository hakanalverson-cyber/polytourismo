import sys
from shot import run,W
tr=sys.argv[1];tod=sys.argv[2];times=[float(x) for x in sys.argv[3].split(',')];mode=sys.argv[4] if len(sys.argv)>4 else 'ta'
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',1000),
('js',"(()=>{PT8.launch({mode:'%s',track:%s,laps:3,humans:[{id:'merc',alt:0,name:'T'}],ai:[],tod:'%s',endur:false});return RACE.T.d.name})()"%(mode,tr,tod)),('wait',7000),
('js',"(()=>{const c=RACE.cars[0];RACE.state='race';c.forceAI=1;c.ai={skill:.9,lat:0,name:'T'};return 1})()")]
t0=0
for i,t in enumerate(times):
    n=int((t-t0)*60);t0=t
    st+=[('js',"(()=>{for(let i=0;i<%d;i++)step(1/60);return 1})()"%n),('wait',900),('shot','t%d'%i)]
run(W+'/Poly-Tourismo.html',st,'tr%s%s'%(tr,tod))
