from shot import run,W
js="""(()=>{const res={};for(const tr of [8]){for(const rev of [false,true]){for(const id of ['merc','lr']){
  PT8.launch({mode:'ta',track:tr,laps:2,humans:[{id:id,alt:0}],ai:[],rev});
  const c=RACE.cars[0];c.forceAI=1;c.ai={skill:1,lat:0,name:'T'};
  let ex=0,rs=0,pe=false,pr=false,off=0;
  for(let i=0;i<60*300;i++){step(1/60);if(RACE.state==='done')break;const e=c.exp>0;if(e&&!pe)ex++;pe=e;const r=c.respT>.5;if(r&&!pr)rs++;pr=r;if(RACE.state==='race'&&c.onRoad===false)off++}
  res[tr+(rev?'r':'')+id]={lap:(c.lapT||[]).map(x=>+x.toFixed(1)),ex,rs,off,fin:c.fin}}}}
 return res})()"""
run(W+'/Poly-Tourismo.html',[('js',js)],'ntl')
