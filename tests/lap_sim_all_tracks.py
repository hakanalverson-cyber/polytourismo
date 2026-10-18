import sys,json
from shot import run,W
cars=sys.argv[1].split(',') if len(sys.argv)>1 else ['merc']
js="""
(()=>{const res={};
 for(const id of %s){ for(let tr=0;tr<D.length;tr++){
  PT8.launch({mode:'ta',track:tr,laps:1,humans:[{id:id,alt:0}],ai:[]});
  const c=RACE.cars[0];c.forceAI=1;c.ai={skill:1,lat:0,name:'T'};
  let ex=0,rs=0,pe=false,pr=false,mx=0,gs=0,pg=0;
  for(let i=0;i<60*260;i++){step(1/60);if(RACE.state==='done')break;const e=c.exp>0;if(e&&!pe)ex++;pe=e;const r=c.respT>.5;if(r&&!pr)rs++;pr=r;mx=Math.max(mx,c.sp);if((c.gear|0)!==pg){gs++;pg=c.gear|0}}
  res[id+'@'+tr]={lap:(c.lapT||[]).map(x=>+x.toFixed(1)),ex,rs,fin:c.fin,kmh:Math.round(mx*3.6),shifts:gs};
 }}
 return res})()
"""%json.dumps(cars)
run(W+'/Poly-Tourismo.html',[('js',js)],'all')
