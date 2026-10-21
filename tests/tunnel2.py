from shot import run,W
js="""(()=>{const out=[];for(const tk of [2]){try{PT8.dmgOn=()=>false;PT8.launch({mode:'ta',track:tk,laps:1,humans:[{id:'merc',alt:0}],ai:[]});scr='game';paused=false;
 for(let i=0;i<60*6;i++)step(1/60);RACE.state='race';const T=RACE.T,c=RACE.cars[0];let k=-1;for(let i=0;i<T.N;i++)if(T.tn&&T.tn[i]&&T.wall[i]&&T.tn[(i+5)%T.N]&&T.tn[(i-5+T.N)%T.N]){k=i;break}
 if(k<0){out.push([tk,'notunnel']);continue}
 let esc=0;for(let t=0;t<40;t++){const sg=t%2?1:-1,ps=T.psi[k],nx=Math.cos(ps)*sg,nz=-Math.sin(ps)*sg;
  c.x=T.x[k]-nx*(T.hw[k]-4);c.z=T.z[k]-nz*(T.hw[k]-4);c.y=T.y[k]+.5;c.vx=nx*90;c.vz=nz*90;c.vy=0;c.idx=k;c.yaw=Math.atan2(nx,nz);c.exp=0;c.respT=0;c._wl=null;c._px=c.x;c._pz=c.z;
  const tr=[];for(let s=0;s<6;s++){step(1/20);tr.push(PT8._kc+"|"+JSON.stringify(PT8._kb)+"|"+c._wl,+((c.x-T.x[k])*Math.cos(ps)-(c.z-T.z[k])*Math.sin(ps)).toFixed(1))}if(t<1)out.push([sg,tr.join(','),T.hw[k],T.hw[(k+1)%T.N],c.y-T.y[k],c.idx,k]);const lat=(c.x-T.x[k])*Math.cos(ps)-(c.z-T.z[k])*Math.sin(ps);if(Math.abs(lat)>T.hw[k])esc++}
 out.push([tk,'esc',esc,'/40'])}catch(e){out.push([tk,String(e)])}}return out})()"""
run(W+'/Poly-Tourismo.html',[('js',js)],'tunnel')
