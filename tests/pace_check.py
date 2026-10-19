from shot import run,W
steps=[('wait',800),('js',"""(()=>{const o={};for(const i of PT8.STAGES){const T=sampleTrack(D[i]);o[i]={pinch:T.pinch.length,minhw:+Math.min(...T.hw).toFixed(2),cor:PT8.kappa&&0}}return JSON.stringify(o)})()"""),
('js',"""(()=>{PT8.ui.openCards();document.querySelector('[data-m=rally]').click();PT8.ui.ST.players=1;PT8.ui.ST.track=10;PT8.ui.renderSetup();document.getElementById('suGo').click();return 1})()"""),('wait',9000),
('js',"""(()=>{document.getElementById('rlPlay').click();return 1})()"""),('wait',300),
('js',"""(()=>{const c=RACE.cars[0];c.forceAI=1;c.ai={skill:1,lat:0,name:'T'};const log=[];let last='',stuck=0,T=RACE.T;
for(let i=0;i<60*230;i++){step(1/60);if(i%30===0){hudUpdate();const el=document.querySelector('.h8pace');const t=el?el.textContent.replace(/\\s+/g,' '):'';if(t!==last){log.push(Math.round(c.unw*T.sp)+':'+t);last=t}}
 if(RACE.state==='done')break}
return log.length+' '+log.slice(0,45).join(' | ')})()""")]
run(W+'/Poly-Tourismo.html',steps,'pc')
