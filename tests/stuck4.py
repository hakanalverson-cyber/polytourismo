from shot import run,W
js="""(()=>{const out=[];let cur={th:1,br:0,st:0,hb:0};window.readIn=()=>cur;PT8.dmgOn=()=>false;PT8.launch({mode:'ta',track:3,laps:1,humans:[{id:'merc',alt:0}],ai:[]});scr='game';paused=false;
 for(let i=0;i<360;i++)step(1/60);RACE.state='race';const T=RACE.T,c=RACE.cars[0];
 const k=94,ang=.15,sg=1,ps=T.psi[k];const lat=sg*(T.hw[k]-1.6),fx=Math.sin(ps),fz=Math.cos(ps),nx=Math.cos(ps)*sg,nz=-Math.sin(ps)*sg;
 c.exp=0;c.respT=0;c.x=T.x[k]+Math.cos(ps)*lat;c.z=T.z[k]-Math.sin(ps)*lat;c.y=T.y[k]+.6;const h=Math.atan2(fx*Math.cos(ang)+nx*Math.sin(ang),fz*Math.cos(ang)+nz*Math.sin(ang));
 c.yaw=h;c.vx=Math.sin(h)*35;c.vz=Math.cos(h)*35;c.vy=0;c.idx=k;c._wl=null;c._px=c.x;c._pz=c.z;cur={th:1,br:0,st:0,hb:0};
 for(let s=0;s<120;s++){c.gear=c.sp<18?1:9;step(1/60);if(s%12==0)out.push([s,+c.yaw.toFixed(2),Math.round(c.sp),+c.x.toFixed(1),+c.z.toFixed(1),c.gear,JSON.stringify(c.in),c.exp,c.respT,RACE.state,c.fin,c.stuck,c.flip])}
 cur={th:1,br:0,st:1,hb:0};out.push('steer');
 for(let s=0;s<120;s++){c.gear=c.sp<18?1:9;step(1/60);if(s%12==0){const q=T.surf(c.x,c.z,c.y);const near=[];const g=T._bg;if(g){const cx=Math.floor(c.x/8),cz=Math.floor(c.z/8);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const l=g.get((cx+a)+','+(cz+b));if(l)for(const e of l){let qx,qz,r;if(e.length===5){const dx=e[2]-e[0],dz=e[3]-e[1],ll=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((c.x-e[0])*dx+(c.z-e[1])*dz)/ll));qx=e[0]+dx*t;qz=e[1]+dz*t;r=e[4]}else{qx=e[0];qz=e[1];r=e[2]}const d=Math.hypot(c.x-qx,c.z-qz);if(d<r+1.5)near.push((d-r).toFixed(2)+(e.length===5?'s':'p'))}}}out.push([near.join('/'),s,+c.yaw.toFixed(2),Math.round(c.sp),q.lat.toFixed(1),T.hw[q.i],c.m.wheels.map(w=>w.g?1:0).join(''),+c.y.toFixed(2),+q.h.toFixed(2),c.pitch.toFixed(2),c.roll.toFixed(2)])}}
 return out})()"""
run(W+'/Poly-Tourismo.html',[('js',js)],'stuck3')
