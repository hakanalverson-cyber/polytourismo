from shot import run,W
js="""(()=>{const o=[];for(const tr of [15,14]){const t0=performance.now();PT8.launch({mode:'ta',track:tr,laps:1,humans:[{id:'merc',alt:0}],ai:[]});o.push(tr+':'+Math.round(performance.now()-t0)+'ms');if(tr==15)break}
 scr='game';paused=false;RACE.state='race';for(let i=0;i<200;i++)step(1/60);document.querySelectorAll('.title,#title,.ttl,#ptTitle').forEach(e=>e.style.display='none');return o.join(' ')})()"""
run(W+'/Poly-Tourismo.html',[('js',"(()=>{dispatchEvent(new KeyboardEvent('keydown',{key:'Enter'}));return 1})()"),('wait',2000),('js',js),('wait',2500),('shot','a')],'im5')
