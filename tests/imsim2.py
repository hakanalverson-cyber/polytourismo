from shot import run,W
js="""(()=>{const out=[];PT8.launch({mode:'mp',rally:true,circuit:true,track:15,laps:2,humans:[{id:'merc',alt:0}],ai:[]});
 const c=RACE.cars[0];c.forceAI=1;c.ai={skill:1,lat:0,name:'T'};
 for(let i=0;i<60*240;i++){step(1/60);if(i%1200==0)out.push([i/60|0,RACE.state,c.idx,Math.round(c.sp*3.6),(c.lapT||[]).length,c.lap])}
 return JSON.stringify(out)})()"""
run(W+'/Poly-Tourismo.html',[('js',js)],'ims2')
