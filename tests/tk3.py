from shot import run,W
js="""(()=>{PT8._to=true;const ids=PT8.TRACK_CARS;PT8.launch({mode:'mp',track:14,laps:2,humans:[{id:'c107',alt:0}],ai:ids.filter(i=>i!=='c107').map((id,k)=>({id,alt:0,skill:.95,name:id,lat:((k*5)%7-3)/4})),tod:'day',weather:'clear',circuit:1});
const st={};for(const c of RACE.cars){st[c.carId]={max:0,off:0,rs:0,wasR:0}}
for(let i=0;i<60*230;i++){step(1/60);for(const c of RACE.cars){const s=st[c.carId];s.max=Math.max(s.max,c.sp);if(!c.onRoad&&RACE.state==='race')s.off++;if(c.respT>0&&!s.wasR)s.rs++;s.wasR=c.respT>0?1:0}}
return RACE.cars.map(c=>c.carId+' top '+Math.round(st[c.carId].max*2.237)+'mph laps '+(c.lapT||[]).map(t=>t.toFixed(1)).join('/')+' off '+st[c.carId].off+' resp '+st[c.carId].rs).join('\\n')})()"""
run(W+'/Poly-Tourismo.html',[('wait',800),('js',js)],'tk3')
