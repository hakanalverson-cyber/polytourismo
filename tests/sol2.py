from shot import run,W
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',800)]
for t in [0,1,3,5,7,8,14]:
    st+=[('js',"(()=>{PT8.launch({mode:'ta',track:%d,laps:1,humans:[{id:'merc',alt:0,name:'T'}],ai:[],tod:'day',endur:false});return 1})()"%t),('wait',6500),('js',"""(()=>{const T=RACE.T,x=T._bx,N=T.N;let bad=0,tot=0;const chk=(px,pz,r)=>{let b=1e9,k=0;for(let i=0;i<N;i+=2){const d=Math.hypot(px-T.x[i],pz-T.z[i]);if(d<b){b=d;k=i}}return b<T.hw[k]+r+.2};
 for(const s of x.segs){for(const f of [0,.5,1]){const px=s[0]+(s[2]-s[0])*f,pz=s[1]+(s[3]-s[1])*f;tot++;if(chk(px,pz,0))bad++}}
 for(const p of x.pts){tot++;if(chk(p[0],p[1],0))bad++}
 const s=x.segs[Math.floor(x.segs.length/2)],c=RACE.cars[0];RACE.state='race';c.respT=0;c.fin=false;const mx=(s[0]+s[2])/2,mz=(s[1]+s[3])/2,dx=s[3]-s[1],dz=-(s[2]-s[0]),l=Math.hypot(dx,dz)||1;c.x=mx-dx/l*.3;c.z=mz-dz/l*.3;c.y=T.terr(c.x,c.z)+.5;c.vx=dx/l*12;c.vz=dz/l*12;
 for(let i=0;i<4;i++)step(1/60);const d=Math.hypot(c.x-mx,c.z-mz);return T.d.name+' onRoad='+bad+'/'+tot+' pushedOut='+d.toFixed(2)})()""")]
run(W+'/Poly-Tourismo.html',st,'sol2')
