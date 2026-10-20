import sys
from shot import run,W
tr,idx=sys.argv[1],sys.argv[2]
js="""(()=>{const T=RACE.T,N=T.N,i=%s,o=[];for(let j=0;j<N;j++){if(Math.abs(j-i)<25||N-Math.abs(j-i)<25)continue;const d=Math.hypot(T.x[j]-T.x[i],T.z[j]-T.z[i]);if(d<T.hw[i]+T.hw[j]+6)o.push(j+":"+d.toFixed(1)+"/dy"+(T.y[j]-T.y[i]).toFixed(1))}
const a=[];for(let q=-6;q<=6;q+=2)a.push((i+q)+":"+T.y[i+q].toFixed(2)+(T.br[i+q]?"b":"")+(T.gap[i+q]?"g":""));return JSON.stringify({near:o.slice(0,12),prof:a.join(" ")})})()"""%idx
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',1000),
('js',"(()=>{PT8.launch({mode:'ta',track:%s,laps:2,humans:[{id:'merc',alt:0,name:'T'}],ai:[],tod:'day',endur:false});return 1})()"%tr),('wait',7000),('js',js)]
run(W+'/Poly-Tourismo.html',st,'jt2')
