from shot import run,W
js="""(()=>{const out=[];for(const mode of ['kb']){PT8.launch({mode:'ta',track:14,laps:1,humans:[{id:'merc',alt:0}],ai:[]});RACE.state='race';const c=RACE.cars[0];
 // fly the car onto the long straight: use track samples; just drive straight with AI until speed ~45
 c.forceAI=1;c.ai={skill:1,lat:0,name:'T'};for(let i=0;i<60*14;i++)step(1/60);c.forceAI=0;
 const v0=c.sp;let log=[];let t=0;
 // hold straight 0.5s then steer
 const K=(t,k,d)=>dispatchEvent(new KeyboardEvent(d?'keydown':'keyup',{code:k,key:k}));K(0,'KeyW',1);K(0,'ArrowUp',1);for(let i=0;i<60*3;i++){const tt=i/60;let st=tt<.5?0:1;if(i==30){K(0,'ArrowLeft',1);K(0,'KeyA',1)}
  const x0=c.x,z0=c.z,h0=c.yaw;step(1/60);
  if(i%12==0&&tt>.4){const dx=c.x-x0,dz=c.z-z0;const pathAng=Math.atan2(dx,dz);let sl=pathAng-c.yaw;sl=Math.atan2(Math.sin(sl),Math.cos(sl));log.push([+tt.toFixed(1),Math.round(c.sp),+c.yr.toFixed(2),+(Math.hypot(c.vx,c.vz)*c.yr/9.8).toFixed(2),c.drifting?1:0,+(sl*57.3).toFixed(0),JSON.stringify(c.in),c.lastSide,+(c.sideT||0).toFixed(2),+(c.driftTimer||0).toFixed(2)])}}
 out.push(mode+' v0='+Math.round(v0)+' '+JSON.stringify(log))}
 return out.join(' || ')})()"""
run(W+'/Poly-Tourismo.html',[('js',js)],'us1')
