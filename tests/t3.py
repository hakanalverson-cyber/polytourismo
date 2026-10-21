from shot import run,W
js="""(()=>{PT8.dmgOn=()=>false;PT8.launch({mode:'ta',track:2,laps:1,humans:[{id:'merc',alt:0}],ai:[]});scr='game';paused=false;
 for(let i=0;i<360;i++)step(1/60);RACE.state='race';const T=RACE.T,c=RACE.cars[0];const k=380,ps=T.psi[k];
 c.x=T.x[k]+Math.cos(ps)*2.5;c.z=T.z[k]-Math.sin(ps)*2.5;c.idx=k;const o=[];
 for(let q=-3;q<=3;q++){const i=k+q,j=i+1,dx=T.x[j]-T.x[i],dz=T.z[j]-T.z[i];o.push([q,+(((c.x-T.x[i])*dx+(c.z-T.z[i])*dz)/(dx*dx+dz*dz)).toFixed(2),T.gap[i],T.wall[i],T.hw[i]])}
 return [o,Object.keys(RACE.cars[0]).join(',').slice(0,300),typeof T.N,T.N]})()"""
run(W+'/Poly-Tourismo.html',[('js',js)],'t3')
