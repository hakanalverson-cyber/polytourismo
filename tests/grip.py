from shot import run,W
js="""(()=>{const out=[];for(const tk of [0,1,2,3,5]){PT8.dmgOn=()=>false;PT8.launch({mode:'ta',track:tk,laps:1,humans:[{id:'merc',alt:0}],ai:[]});scr='game';paused=false;
 for(let i=0;i<360;i++)step(1/60);RACE.state='race';const T=RACE.T,c=RACE.cars[0];const r=[];
 for(const off of [0,-.5,.5,1,1.3,3]){const k=300,ps=T.psi[k],l=T.hw[k]+off;c.x=T.x[k]+Math.cos(ps)*l;c.z=T.z[k]-Math.sin(ps)*l;c.y=T.y[k]+.4;c.vx=c.vz=0;c.idx=k;step(1/60);r.push(off+':'+(c.mt.grip.toFixed(2)))}
 out.push([tk,T.d.off,r.join(' ')])}return out})()"""
run(W+'/Poly-Tourismo.html',[('js',js)],'grip')
