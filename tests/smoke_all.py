from shot import run,W
js="""(()=>{const out={};for(let tr=0;tr<D.length;tr++){try{PT8.launch({mode:'mp',track:tr,laps:2,humans:[{id:'merc',alt:0},{id:'lr',alt:0}],ai:PT8.makeAI({n:2,classes:['B','A'],skill:.9,rally:!!D[tr].gravel})});
 for(let i=0;i<60*5;i++)step(1/60);for(let i=0;i<3;i++)hudUpdate();out[tr]=RACE.cars.length+'/'+(FS.userData.propError||'ok')}catch(e){out[tr]='ERR '+e.message}}return JSON.stringify(out)})()"""
run(W+'/Poly-Tourismo.html',[('wait',800),('js',js)],'smk')
