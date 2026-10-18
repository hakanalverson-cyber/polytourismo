from shot import run,W
setup="""(()=>{const P=PT8;P.tuneSet('merc',0,'aero',3);P.tuneSet('merc',0,'susp',2);P.tuneSet('merc',0,'gear',-2);P.tuneSet('merc',0,'brake',1);P.ui.openShow('garage',{player:0,cap:null,ret:'menu'});return JSON.stringify(P.tuneGet('merc',0))})()"""
sim="""(()=>{const out={};for(const [nm,tn] of [['stock',null],['short',{gear:-3,tyre:0,susp:0,aero:0,brake:0}],['long',{gear:3,tyre:0,susp:0,aero:0,brake:0}],['aero',{gear:0,tyre:0,susp:0,aero:3,brake:0}]]){
 PT8.tuneReset('merc',0);if(tn)for(const k in tn)PT8.tuneSet('merc',0,k,tn[k]);
 PT8.launch({mode:'mp',track:0,laps:2,humans:[{id:'merc',alt:0}],ai:[]});const h=RACE.cars[0];h.forceAI=1;h.ai={skill:1,lat:0,name:'T'};
 let t100=null,top=0,lap=null;for(let i=0;i<60*140;i++){step(1/60);if(RACE.state!=='race')continue;if(t100==null&&h.sp*3.6>=100)t100=RACE.t;top=Math.max(top,h.sp*3.6);if(!lap&&h.lapT&&h.lapT.length){lap=h.lapT[0];break}}
 out[nm]={t100:t100&&+t100.toFixed(2),top:+top.toFixed(1),lap:lap&&+lap.toFixed(2),tune:!!h.tune}}
 PT8.tuneReset('merc',0);
 PT8.launch({mode:'ta',track:0,laps:2,humans:[{id:'merc',alt:0}],ai:[]});out.taTune=RACE.cars[0].tune;return out})()"""
run(W+'/Poly-Tourismo.html',[('wait',1000),('js',setup),('wait',2500),('shot','garage'),('wait',900),('shot','garage2')],'tu')
