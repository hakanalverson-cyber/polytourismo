import json
from shot import run,W
js="""(()=>{const res={};for(const id of ['merc','c0']){const tr=15;
  PT8.launch({mode:'mp',rally:true,circuit:true,track:tr,laps:2,humans:[{id:id,alt:0}],ai:[]});
  const c=RACE.cars[0];c.forceAI=1;c.ai={skill:1,lat:0,name:'T'};let ex=0,rs=0,pe=false,pr=false,mx=0;
  for(let i=0;i<60*400;i++){step(1/60);if(RACE.state==='done')break;const e=c.exp>0;if(e&&!pe)ex++;pe=e;const r=c.respT>.5;if(r&&!pr)rs++;pr=r;mx=Math.max(mx,c.sp)}
  res[id]={lap:(c.lapT||[]).map(x=>+x.toFixed(1)),ex,rs,fin:c.fin,kmh:Math.round(mx*3.6),L:Math.round(RACE.T.L),N:RACE.T.N}}
 return JSON.stringify(res)})()"""
run(W+'/Poly-Tourismo.html',[('js',js)],'ims')
