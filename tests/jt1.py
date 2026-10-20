import sys
from shot import run,W
tr=sys.argv[1]
js="""(()=>{const T=RACE.T,N=T.N;let worst=0,wi=-1,wl=0;
for(const fr of[-.85,-.5,0,.5,.85]){let prev=null;for(let u=0;u<N;u+=.1){const i=Math.floor(u),j=(i+1)%N,f=u-i;let ng=0;for(let q=-4;q<=4;q++)if(T.gap[(i+q+N)%N])ng=1;if(ng){prev=null;continue}
 const x0=T.x[i]+(T.x[j]-T.x[i])*f,z0=T.z[i]+(T.z[j]-T.z[i])*f,psi=T.psi[i],l=fr*T.hw[i],x=x0+Math.cos(psi)*l,z=z0-Math.sin(psi)*l,yy=T.y[i]+(T.y[j]-T.y[i])*f-l*T.bank[i];
 const h=T.surf(x,z,yy+1).h;if(prev!==null){const dj=Math.abs(h-prev);if(dj>worst){worst=dj;wi=i;wl=fr}}prev=h}}
return JSON.stringify({n:T.d.name,worst:+worst.toFixed(2),at:wi,lat:wl})})()"""
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',1000),
('js',"(()=>{PT8.launch({mode:'ta',track:%s,laps:2,humans:[{id:'merc',alt:0,name:'T'}],ai:[],tod:'day',endur:false});return 1})()"%tr),('wait',7000),('js',js)]
run(W+'/Poly-Tourismo.html',st,'jt')
