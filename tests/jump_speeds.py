from shot import run,W
run(W+'/Poly-Tourismo.html',[('js','''(()=>{const o={};for(let tr=0;tr<7;tr++){PT8.launch({mode:'ta',track:tr,laps:1,humans:[{id:'merc',alt:0}],ai:[]});const Rc=RACE,T=Rc.T,c=Rc.cars[0];c.forceAI=1;c.ai={skill:1,lat:0,name:'T'};const J=T.jumps.slice();const sp=J.map(()=>null);
 for(let i=0;i<60*200&&Rc.state!=='done';i++){step(1/60);J.forEach((j,k)=>{if(sp[k]===null&&((c.idx-j+T.N)%T.N)<3&&c.unw>5)sp[k]=Math.round(c.sp*3.6)})}
 o[tr]={jumps:J,frac:J.map(j=>+(j/T.N).toFixed(2)),kmhAtJump:sp,rs:c.respT>0,fin:c.fin};PT8.cleanupRace()}return JSON.stringify(o)})()''')],'jm')
