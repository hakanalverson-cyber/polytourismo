from shot import run,W
js="""(()=>{const out=[];let cur={th:1,br:0,st:0,hb:0};window.readIn=()=>cur;PT8.dmgOn=()=>false;PT8.launch({mode:'ta',track:0,laps:1,humans:[{id:'merc',alt:0}],ai:[]});scr='game';paused=false;
 for(let i=0;i<360;i++)step(1/60);RACE.state='race';const T=RACE.T,c=RACE.cars[0];
 const k=342,ang=1.2,sg=1,ps=T.psi[k];const lat=sg*(T.hw[k]-1.6),fx=Math.sin(ps),fz=Math.cos(ps),nx=Math.cos(ps)*sg,nz=-Math.sin(ps)*sg;
 c.exp=0;c.respT=0;c.x=T.x[k]+Math.cos(ps)*lat;c.z=T.z[k]-Math.sin(ps)*lat;c.y=T.y[k]+.6;const h=Math.atan2(fx*Math.cos(ang)+nx*Math.sin(ang),fz*Math.cos(ang)+nz*Math.sin(ang));
 c.yaw=h;c.vx=Math.sin(h)*35;c.vz=Math.cos(h)*35;c.vy=0;c.idx=k;c._wl=null;c._px=c.x;c._pz=c.z;cur={th:1,br:0,st:0,hb:0};
 for(let s=0;s<120;s++){c.gear=9;step(1/60);if(s%12==0)out.push([s,+c.yaw.toFixed(2),Math.round(c.sp),+c.x.toFixed(1),+c.z.toFixed(1),c.gear,JSON.stringify(c.in),c.exp,c.respT,RACE.state,c.fin,c.stuck,c.flip])}
 cur={th:1,br:0,st:1,hb:0};out.push('steer');
 for(let s=0;s<120;s++){c.gear=9;step(1/60);if(s%12==0){const q=T.surf(c.x,c.z,c.y);out.push([s,+c.yaw.toFixed(2),Math.round(c.sp),q.lat.toFixed(1),T.hw[q.i],c.m.wheels.map(w=>w.g?1:0).join(''),+c.y.toFixed(2),+q.h.toFixed(2),c.pitch.toFixed(2),c.roll.toFixed(2)])}}
 return out})()"""
run(W+'/Poly-Tourismo.html',[('js',js)],'stuck3')
