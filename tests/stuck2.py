from shot import run,W
js="""(()=>{const out=[];let cur={th:1,br:0,st:0,hb:0};window.readIn=()=>cur;PT8.dmgOn=()=>false;PT8.launch({mode:'ta',track:0,laps:1,humans:[{id:'merc',alt:0}],ai:[]});scr='game';paused=false;
 for(let i=0;i<360;i++)step(1/60);RACE.state='race';const T=RACE.T,c=RACE.cars[0];
 for(const [nk,nb] of [[0,0],[1,0]]){PT8.noKerb=nk;PT8.noBS=nb;const k=342,ang=nk?0:.15,sg=1,ps=T.psi[k];
  const lat=nk?0:sg*(T.hw[k]-1.6),fx=Math.sin(ps),fz=Math.cos(ps),nx=Math.cos(ps)*sg,nz=-Math.sin(ps)*sg;
  c.exp=0;c.respT=0;c.x=T.x[k]+Math.cos(ps)*lat;c.z=T.z[k]-Math.sin(ps)*lat;c.y=T.y[k]+.6;const h=Math.atan2(fx*Math.cos(ang)+nx*Math.sin(ang),fz*Math.cos(ang)+nz*Math.sin(ang));
  c.yaw=h;c.vx=Math.sin(h)*35;c.vz=Math.cos(h)*35;c.vy=0;c.idx=k;c._wl=null;c._px=c.x;c._pz=c.z;cur={th:1,br:0,st:0,hb:0};
  const tr=[];for(let s=0;s<180;s++){c.gear=9;step(1/60);if(s%30==29)tr.push([Math.round(c.sp),+((c.x-T.x[c.idx])*Math.cos(T.psi[c.idx])-(c.z-T.z[c.idx])*Math.sin(T.psi[c.idx])).toFixed(1)])}
  out.push([nk,nb,JSON.stringify(tr)])}
 return out})()"""
run(W+'/Poly-Tourismo.html',[('js',js)],'stuck2')
