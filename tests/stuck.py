from shot import run,W
js="""(()=>{const out=[];let cur={th:1,br:0,st:0,hb:0};window.readIn=()=>cur;
 for(const tk of [0,1,2,3,5,6]){try{PT8.dmgOn=()=>false;PT8.launch({mode:'ta',track:tk,laps:1,humans:[{id:'merc',alt:0}],ai:[]});scr='game';paused=false;
 for(let i=0;i<360;i++)step(1/60);RACE.state='race';const T=RACE.T,c=RACE.cars[0];const res=[];
 const ks=[];for(let i=20;i<T.N-20;i+=Math.floor(T.N/14))if(T.wall[i]&&!T.tn[i]&&!T.gap[i])ks.push(i);
 for(const k of ks){for(const ang of [.15,.5,1.2]){for(const sg of [-1,1]){const ps=T.psi[k];
  const lat=sg*(T.hw[k]-1.6),fx=Math.sin(ps),fz=Math.cos(ps),nx=Math.cos(ps)*sg,nz=-Math.sin(ps)*sg;
  c.exp=0;c.respT=0;c.x=T.x[k]+Math.cos(ps)*lat;c.z=T.z[k]-Math.sin(ps)*lat;c.y=T.y[k]+.6;const h=Math.atan2(fx*Math.cos(ang)+nx*Math.sin(ang),fz*Math.cos(ang)+nz*Math.sin(ang));
  c.yaw=h;c.vx=Math.sin(h)*35;c.vz=Math.cos(h)*35;c.vy=0;c.idx=k;c._wl=null;c._px=c.x;c._pz=c.z;cur={th:1,br:0,st:0,hb:0};
  const x0=c.x,z0=c.z;for(let s=0;s<180;s++){c.gear=c.sp<18?1:9;step(1/60)}const d=Math.hypot(c.x-x0,c.z-z0),sp1=c.sp;
  /* now steer away from wall w/ throttle 2 s */
  const x1=c.x,z1=c.z;const sv=[c.x,c.z,c.yaw,c.vx,c.vz];let d2=0;for(const stv of [1,-1]){c.x=sv[0];c.z=sv[1];c.yaw=sv[2];c.vx=sv[3];c.vz=sv[4];cur={th:1,br:0,st:stv,hb:0};for(let s=0;s<120;s++){c.gear=c.sp<18?1:9;step(1/60)}d2=Math.max(d2,Math.hypot(c.x-x1,c.z-z1))}
  res.push([k,ang,sg,Math.round(d),Math.round(sp1),Math.round(d2)])}}}
 const bad=res.filter(r=>r[3]<70||r[5]<25);out.push([tk,res.length,'bad',bad.length,JSON.stringify(bad.slice(0,6))])}catch(e){out.push([tk,String(e)])}}return out})()"""
run(W+'/Poly-Tourismo.html',[('js',js)],'stuck')
