from shot import run,W
a="""(()=>{PT8.launch({mode:'mp',track:0,laps:10,humans:[{id:'merc',alt:0}],ai:PT8.makeAI({n:3,classes:['B','A'],skill:.9,rally:false})});
 const out={endur:RACE.cfg.endur,pit:RACE.pit};const h=RACE.cars[0];h.forceAI=1;h.ai={skill:1,lat:0,name:'T'};
 let drafts=0,maxD=0,mxPit=0;const T0=[];
 for(let i=0;i<60*400;i++){step(1/60);if(RACE.state!=='race')continue;for(const c of RACE.cars){if(c.draft>.2){drafts++;maxD=Math.max(maxD,c.draft)}}
  if(i%3600===0)T0.push(RACE.cars.map(c=>[+(c.tyre||0).toFixed(2),+(c.fuel||0).toFixed(2),c.pitCount||0,Math.floor(c.unw/RACE.T.N)]));}
 out.drafts=drafts;out.maxD=+maxD.toFixed(2);out.snap=T0;out.state=RACE.state;return out})()"""
run(W+'/Poly-Tourismo.html',[('js',a)],'r2')
