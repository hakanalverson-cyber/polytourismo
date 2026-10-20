from shot import run,W
js="""(()=>{const res={};for(const [gapm,H] of [[22,5.6],[18,5.6],[18,6.5]]){D[8].jumps=[[7,0,gapm,H]];const row={};
 for(const kmh of [90,100,110,120,130,140]){PT8.launch({mode:'ta',track:8,laps:1,humans:[{id:'merc',alt:0}],ai:[]});const Rc=RACE,T=Rc.T,c=Rc.cars[0];
  for(let i=0;i<60*8&&Rc.state!=='race';i++)step(1/60);
  const J=T.jumps[0],gl=T.jgl,rl=Math.round(60/T.sp),i0=(J-rl-10+T.N)%T.N;
  c.forceAI=1;c.ai={skill:1,lat:0,name:'T'};place(c,i0);for(let i=0;i<120;i++)step(1/60);
  const v=kmh/3.6,ps=T.psi[c.idx];c.vx=Math.sin(ps)*v;c.vz=Math.cos(ps)*v;
  let res_='?',minv=1e9;for(let i=0;i<60*5;i++){c.ai.cap=v;step(1/60);const d=(c.idx-J+T.N)%T.N;if(c.respT>.5||c.exp>0||c.y<T.y[J]-8){res_='FALL';break}if(d>gl+14&&d<80){res_='ok';break}}
  row[kmh]=res_+'@'+Math.round(c.sp*3.6)}
 res[gapm+'m/'+H]=row}return JSON.stringify(res)})()"""
run(W+'/Poly-Tourismo.html',[('js',js)],'j8e')
