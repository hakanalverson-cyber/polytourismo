from shot import run,W
steps=[('wait',800),('js',"""(()=>{PT8.ui.openCards();document.querySelector('[data-m=rally]').click();PT8.ui.ST.players=1;PT8.ui.ST.track=11;PT8.ui.renderSetup();document.getElementById('suGo').click();return 1})()"""),('wait',22000),
('js',"""(()=>{document.getElementById('rlPlay').click();const c=RACE.cars[0];c.forceAI=1;c.ai={skill:1,lat:0,name:'T'};const T=RACE.T;for(let i=0;i<60*400;i++){step(1/60);if(c.unw*T.sp>1200)break}return 'AI to 1200 m, pen '+(RACE.pen||0)})()"""),
('js',"""(()=>{const c=RACE.cars[0],T=RACE.T;c.forceAI=0;const i=c.idx,lat=14,cs=Math.cos(T.psi[i]),sn=Math.sin(T.psi[i]);c.x=T.x[i]+cs*lat;c.z=T.z[i]-sn*lat;c.y=T.y[i]+3;c.yaw=T.psi[i];c.vx=Math.sin(c.yaw)*25;c.vz=Math.cos(c.yaw)*25;c.vy=0;down.add('KeyW');const log=[];for(let k=0;k<60*6;k++){step(1/60);if(k%60===0)log.push(Math.round(c.sp*3.6)+'kmh onRoad '+c.onRoad+' pen '+(RACE.pen||0)+' acc '+(RACE.cut?RACE.cut.acc.toFixed(0):'-'))}down.delete('KeyW');return log.join(' | ')})()"""),
('js',"""(()=>{const c=RACE.cars[0];c.camMode=1;return 1})()"""),('wait',1500),('shot','ct_hood')]
run(W+'/Poly-Tourismo.html',steps,'ct')
