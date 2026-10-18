from shot import run,W
a="""(()=>{const out={};for(const tr of [0,3,4]){for(const wx of ['clear','rain','storm','fog']){
 PT8.launch({mode:'mp',track:tr,laps:3,humans:[{id:'merc',alt:0}],ai:[],weather:wx});const h=RACE.cars[0];h.forceAI=1;h.ai={skill:.95,lat:0,name:'T'};
 let lap=null,off=0;for(let i=0;i<60*150;i++){step(1/60);if(RACE.state!=='race')continue;if(h.onRoad===false)off++;if(!lap&&h.lapT&&h.lapT.length){lap=h.lapT[0];break}}
 out[tr+wx]=[lap&&+lap.toFixed(2),off]}}return out})()"""
run(W+'/Poly-Tourismo.html',[('js',a)],'wl')
