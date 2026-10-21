from shot import run,W
js="""(()=>{const out={};for(const ns of [true,false]){let cross=0,tot=0;
 for(const tr of [1,3]){PT8.noSweep=ns;PT8.launch({mode:'ta',track:tr,laps:1,humans:[{id:'merc',alt:0}],ai:[]});scr='game';paused=false;
  for(let i=0;i<60*2;i++)step(1/60);RACE.state='race';for(let i=0;i<30;i++)step(1/60);const T=RACE.T,bx=T._bx,c=RACE.cars[0];if(!bx)return 'no bx';
  const segs=bx.segs.filter(s=>Math.hypot(s[2]-s[0],s[3]-s[1])>3&&Math.hypot(s[2]-s[0],s[3]-s[1])<7).slice(0,40);
  for(const s of segs){const mx=(s[0]+s[2])/2,mz=(s[1]+s[3])/2,dx=s[2]-s[0],dz=s[3]-s[1],L=Math.hypot(dx,dz);let nx=-dz/L,nz=dx/L;
   c.x=mx-nx*9;c.z=mz-nz*9;c._px=c.x;c._pz=c.z;c.y=(T.terr?T.terr(c.x,c.z):c.y)+.3;c.vx=nx*95;c.vz=nz*95;c.yaw=Math.atan2(nx,nz);c.sp=95;c.vy=0;c.respT=0;c.exp=0;c.fin=0;
   let side0=-1;for(let k=0;k<12;k++){step(1/20);c.vx=c.vx||0}
   const side=(c.x-mx)*nx+(c.z-mz)*nz;tot++;if(side>1.5)cross++}}
 out[ns?'noSweep':'sweep']=[cross,tot]}
 return out})()"""
run(W+'/Poly-Tourismo.html',[('js',js)],'sweep')
