import json,sys
trs=sys.argv[1] if len(sys.argv)>1 else '[19,22,21]'
js="""(()=>{const out={};for(const tr of TRS){PT8.launch({mode:'mp',track:tr,laps:3,humans:[{id:'merc',alt:0}],ai:PT8.makeAI({n:7,classes:['A'],skill:.88,rally:false}),trackRace:true});
 const sk=[.78,.78,.88,.88,.97,.97,1,1];RACE.cars.forEach((c,i)=>{if(c.human){c.forceAI=1;c.ai={skill:1,lat:0,name:'T'}}else c.ai.skill=sk[i%8];c.carId0=c.cs.id});
 /* same car for everyone so only the driving differs */
 const T=RACE.T,N=T.N,RL=PT8.racingLine(T);const S=RACE.cars.map(c=>({e:0,n:0,rev:0,ls:0,off:0,lap:[],wob:0,pst:0}));
 for(let f=0;f<60*150;f++){step(1/60);if(RACE.state==='count'&&f>30)RACE.state='race';if(RACE.state!=='race')continue;
  RACE.cars.forEach((c,i)=>{const s=S[i];const l=PT8.latOf(T,c);s.e+=Math.abs(l-RL[((c.idx|0)%N+N)%N]);s.n++;const st=c.in.st||0;if(Math.sign(st)!==Math.sign(s.ls)&&Math.abs(st-s.ls)>.5)s.rev++;s.wob+=Math.abs(st-s.pst);s.pst=st;if(Math.abs(st)>.15)s.ls=st;if(!c.onRoad)s.off++})}
 out[tr]=RACE.cars.map((c,i)=>{const s=S[i];return [c.human?'H':c.ai.skill,+(s.e/s.n).toFixed(2),+(s.rev/(s.n/60)).toFixed(2),+(s.wob/s.n).toFixed(3),+(s.off/s.n*100).toFixed(1),(c.lapT||[]).map(x=>+x.toFixed(1)).join('/'),c.cs.name]});PT8.cleanupRace()}return JSON.stringify(out)})()""".replace("TRS",trs)
json.dump([["js","(()=>{const t=document.getElementById('ptTitle');if(t)t.click();return 1})()"],["wait",2000],["js",js]],open('tests/aiq.json','w'))
