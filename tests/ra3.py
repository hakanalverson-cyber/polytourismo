from shot import run,W
import sys
marks=sys.argv[1:] or ['FS','T1','E2','T6','T7','T10a','T11','T12']
st=[('wait',800)]
for m in marks:
    off=-26
    js="(()=>{PT8.launch({mode:'ta',track:14,laps:3,humans:[{id:'c0',alt:0}],ai:[]});const c=RACE.cars[0];for(let i=0;i<420;i++)step(1/60);const T=RACE.T,R=PT8.RA,p=R.pts[R.marks['"+m+"']];let b=1e18,k=0;for(let i=0;i<T.N;i++){const d=(T.x[i]-p[0])**2+(T.z[i]-p[1])**2;if(d<b){b=d;k=i}}const i=((k+("+str(off)+"))+T.N)%T.N;c.idx=i;c.unw=i;c.safeIdx=i;c.safeUnw=i;c.x=T.x[i];c.z=T.z[i];c.y=T.y[i]+.5;c.yaw=T.psi[i];c.vx=Math.sin(T.psi[i])*22;c.vz=Math.cos(T.psi[i])*22;down.add('KeyW');for(let q=0;q<45;q++)step(1/60);for(let q=0;q<3;q++)hudUpdate();return i})()"
    st+=[('js',js),('wait',900),('shot','m_'+m)]
run(W+'/Poly-Tourismo.html',st,'ra3')
