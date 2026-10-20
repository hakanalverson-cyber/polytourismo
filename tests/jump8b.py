from shot import run,W
import json
js="""(()=>{const res={};for(const [gapm,H] of [[22,5.6],[18,5.6],[20,6.5],[18,6.5],[16,6.0]]){D[8].jumps=[[7,0,gapm,H]];const row={};
 for(const kmh of [100,110,120,130,140]){PT8.launch({mode:'ta',track:8,laps:1,humans:[{id:'merc',alt:0}],ai:[]});const Rc=RACE,T=Rc.T,c=Rc.cars[0];
  for(let i=0;i<60*8&&Rc.state!=='race';i++)step(1/60);
  const J=T.jumps[0],gl=T.jgl,rl=Math.round(60/T.sp),i0=(J-rl-6+T.N)%T.N;
  c.x=T.x[i0];c.z=T.z[i0];c.y=T.y[i0]+1.0;c.yaw=T.psi[i0];c.idx=i0;c.unw=i0+T.N;const v=kmh/3.6;c.vx=Math.sin(T.psi[i0])*v;c.vz=Math.cos(T.psi[i0])*v;c.vy=0;c.pitch=0;c.roll=0;c.in={th:1,br:0,st:0,hb:0};
  let fell=false,okc=false;for(let i=0;i<60*6;i++){c.in={th:1,br:0,st:0,hb:0};step(1/60);const d=(c.idx-J+T.N)%T.N;if(d>gl+14&&d<60){okc=true;break}if(c.respT>.5||c.exp>0||c.y<T.y[J]-8){fell=true;break}}
  row[kmh]=okc&&!fell?'ok':'FALL'}
 res[gapm+'m/'+H]=row}return JSON.stringify(res)})()"""
run(W+'/Poly-Tourismo.html',[('js',js)],'j8b')
