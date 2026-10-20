import sys
from shot import run,W
tr,idx=sys.argv[1],sys.argv[2]
js="""(()=>{const T=RACE.T,N=T.N,i=%s,out=[];for(const sd of[-1,1]){const l=sd*(T.hw[i]+.15),c=Math.cos(T.psi[i]),s=Math.sin(T.psi[i]),x=T.x[i]+c*l,z=T.z[i]-s*l,ry=T.y[i]-l*T.bank[i];
out.push({sd,ry:+ry.toFixed(2),terr:+T.terr(x,z).toFixed(2),bank:+T.bank[i].toFixed(3),hw:T.hw[i],dy:+((T.y[(i+3)%%N]-T.y[(i-3+N)%%N])/6).toFixed(2),sp:T.sp});
let m=[];for(let q=-12;q<=12;q++){const j=(i+q+N)%%N,k=(j+1)%%N;const dx=T.x[k]-T.x[j],dz=T.z[k]-T.z[j],f=Math.max(0,Math.min(1,((x-T.x[j])*dx+(z-T.z[j])*dz)/(dx*dx+dz*dz))),px=T.x[j]+dx*f,pz=T.z[j]+dz*f,dist=Math.hypot(x-px,z-pz);if(dist<T.hw[j]+8){const psi=T.psi[j],lat=(x-px)*Math.cos(psi)-(z-pz)*Math.sin(psi),y=T.y[j]+(T.y[k]-T.y[j])*f-lat*T.bank[j];m.push(q+":"+dist.toFixed(1)+"/"+lat.toFixed(1)+"/"+(y-.14+Math.max(0,dist-T.hw[j]-1.25)*.85).toFixed(2))}}out.push(m.join(' '))}
return JSON.stringify(out)})()"""%idx
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',1000),
('js',"(()=>{PT8.launch({mode:'ta',track:%s,laps:2,humans:[{id:'merc',alt:0,name:'T'}],ai:[],tod:'day',endur:false});return 1})()"%tr),('wait',7000),('js',js)]
run(W+'/Poly-Tourismo.html',st,'fl3')
