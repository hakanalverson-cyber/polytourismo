from shot import run,W
a="""(()=>{PT8.launch({mode:'elim',track:0,laps:99,humans:[{id:'merc',alt:0}],ai:PT8.makeAI({n:4,classes:['C','B'],skill:.7,rally:false}),interval:20});
 const h=RACE.cars[0];h.forceAI=1;h.ai={skill:1,lat:0,name:'T'};
 const log=[];let boostFrames=0,boostOnWrong=0;
 for(let i=0;i<60*400&&RACE.state!=='done';i++){step(1/60);hudUpdate();
  if(RACE.state==='race'){const al=RACE.cars.filter(c=>!c.out).sort((a,b)=>b.unw-a.unw);
   if(RACE.elimLast){boostFrames++;if(RACE.elimLast!==al[al.length-1])boostOnWrong++}
   if(i%600===0)log.push([+RACE.t.toFixed(1),al.length,RACE.elimLast?RACE.elimLast.ptName:null]);}
 }
 const outs=RACE.cars.map(c=>[c.ptName,c.out,c.place,c.txt,+(c.finT||0).toFixed(2)]);
 return{state:RACE.state,ending:RACE.ending,t:+RACE.t.toFixed(1),log,outs,boostFrames,boostOnWrong,
  mulLast:RACE.elimLast?PT8.mul(RACE.elimLast):null,hud:document.querySelector('#h0 .h8mode')&&document.querySelector('#h0 .h8mode').textContent}})()"""
run(W+'/Poly-Tourismo.html',[('js',a)],'elim')
