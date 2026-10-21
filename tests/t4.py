from shot import run,W
js="""(()=>{PT8.dmgOn=()=>false;PT8.launch({mode:'ta',track:2,laps:1,humans:[{id:'merc',alt:0}],ai:[]});scr='game';paused=false;
 for(let i=0;i<360;i++)step(1/60);RACE.state='race';const T=RACE.T,c=RACE.cars[0];const k=380,ps=T.psi[k];
 c.x=T.x[k]+Math.cos(ps)*2.5;c.z=T.z[k]-Math.sin(ps)*2.5;c.idx=k;c._wl=2.5;const o=[c.x,c.z,c.idx,c.human,c.fin,c.respT,c.exp,RACE.state,!!T.wall,T.N];
 PT8.kerb(RACE,.05);o.push(c._wl);c.x=T.x[k]-Math.cos(ps)*7;c.z=T.z[k]+Math.sin(ps)*7;const q=[];for(let d=-4;d<=4;d++){const i=k+d,j=i+1;const dx=T.x[j]-T.x[i],dz=T.z[j]-T.z[i];q.push([d,+(((c.x-T.x[i])*dx+(c.z-T.z[i])*dz)/(dx*dx+dz*dz)).toFixed(2),T.gap[i]])}o.push(q);return o})()"""
run(W+'/Poly-Tourismo.html',[('js',js)],'t4')
