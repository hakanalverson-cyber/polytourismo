import sys
from shot import run,W
tr=sys.argv[1]
js="""(()=>{const T=RACE.T,N=T.N;let w=0,wi=-1,bur=0,gap=0,out=[];
for(let i=0;i<N;i+=2){if(T.gap[i]||T.br[i])continue;for(const sd of[-1,1]){const l=sd*(T.hw[i]+.15),c=Math.cos(T.psi[i]),s=Math.sin(T.psi[i]),x=T.x[i]+c*l,z=T.z[i]-s*l,ry=T.y[i]-l*T.bank[i],ty=T.terr(x,z),d=ty-ry;
if(d>.12){bur++;if(d>w){w=d;wi=i}}if(d<-.6){gap++;out.push(i+":"+d.toFixed(1)+(T.br[(i+3)%N]||T.br[(i-3+N)%N]?"b":""))}}}
return JSON.stringify({name:T.d.name,N,buried:bur,maxBury:+w.toFixed(2),at:wi,gapEdges:gap,o:out.slice(0,40).join(" "),hw:T.hw[0]})})()"""
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',1000),
('js',"(()=>{PT8.launch({mode:'ta',track:%s,laps:2,humans:[{id:'merc',alt:0,name:'T'}],ai:[],tod:'day',endur:false});return 1})()"%tr),('wait',7000),('js',js)]
run(W+'/Poly-Tourismo.html',st,'fl')
