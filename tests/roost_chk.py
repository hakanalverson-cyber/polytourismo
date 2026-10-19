from shot import run,W
steps=[('wait',800),('js',"""(()=>{PT8.ui.openCards();document.querySelector('[data-m=rally]').click();PT8.ui.ST.players=1;PT8.ui.ST.track=11;PT8.ui.renderSetup();document.getElementById('suGo').click();return 1})()"""),('wait',9000),
('js',"""(()=>{document.getElementById('rlPlay').click();const c=RACE.cars[0];c.forceAI=1;c.ai={skill:1,lat:0,name:'T'};const T=RACE.T;let mx=0;for(let i=0;i<60*60;i++){step(1/60);if(i>900){const d=RACE.dust;let n=0;for(let k=0;k<d.age.length;k++)if(d.age[k]<d.life[k])n++;mx=Math.max(mx,n)}}return 'live particles max '+mx+' sp '+Math.round(c.sp*3.6)})()"""),('wait',1500),('shot','rs')]
run(W+'/Poly-Tourismo.html',steps,'rs')
