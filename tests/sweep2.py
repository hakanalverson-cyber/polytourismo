from shot import run,W
js="""(()=>{PT8.noSweep=true;PT8.launch({mode:'ta',track:1,laps:1,humans:[{id:'merc',alt:0}],ai:[]});scr='game';paused=false;
 for(let i=0;i<60*7;i++)step(1/60);const T=RACE.T,bx=T._bx,c=RACE.cars[0];const s=bx.segs.filter(s=>Math.hypot(s[2]-s[0],s[3]-s[1])>3)[0];
 const mx=(s[0]+s[2])/2,mz=(s[1]+s[3])/2,dx=s[2]-s[0],dz=s[3]-s[1],L=Math.hypot(dx,dz),nx=-dz/L,nz=dx/L;
 c.x=mx-nx*9;c.z=mz-nz*9;c._px=c.x;c._pz=c.z;c.yaw=Math.atan2(nx,nz);c.sp=95;c.vx=nx*95;c.vz=nz*95;
 const tr=[];for(let k=0;k<8;k++){step(1/20);tr.push([+((c.x-mx)*nx+(c.z-mz)*nz).toFixed(1),+c.sp.toFixed(0),RACE.state,c.human,c.y.toFixed(1)])}
 return {segs:bx.segs.length,pts:bx.pts.length,grid:T._bg&&T._bg.size,tr}})()"""
run(W+'/Poly-Tourismo.html',[('js',js)],'sweep')
