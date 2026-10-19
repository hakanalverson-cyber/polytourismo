from shot import run,W
K=lambda c:f"dispatchEvent(new KeyboardEvent('keydown',{{code:'{c}'}}))"
steps=[('wait',800),('js',"""(()=>{PT8.ui.openCards();document.querySelector('[data-m=rally]').click();PT8.ui.ST.players=1;PT8.ui.ST.track=11;PT8.ui.renderSetup();document.getElementById('suGo').click();return 1})()"""),('wait',9000),('shot','rc_prep'),
('js',"""(()=>{document.getElementById('rlPlay').click();const c=RACE.cars[0];return 'gears '+PT8.GT(c.cs).length+' '+c.cs.id})()"""),
('js',"""(()=>{for(let i=0;i<60*6;i++)step(1/60);const c=RACE.cars[0];down.add('KeyW');const log=[];
for(let i=0;i<60*40;i++){step(1/60);if(i%20===0&&c.sp>0){const G=PT8.GT(c.cs),top=c.cs.top*G[c.gear|0].top;if(c.sp>top*.85&&c.gear<G.length-1){dispatchEvent(new KeyboardEvent('keydown',{code:'KeyE'}));log.push('up->'+c.gear+'@'+Math.round(c.sp*3.6))}}
 if(c.fin)break}
return 'gear '+c.gear+' kmh '+Math.round(c.sp*3.6)+' '+log.join(' ')})()"""),
('js',"""(()=>{const c=RACE.cars[0];dispatchEvent(new KeyboardEvent('keydown',{code:'KeyQ'}));const g=c.gear;down.add('KeyA');down.add('Space');let yaw0=c.yaw,dr=0,sl=0;for(let i=0;i<40;i++){step(1/60);if(c.drifting)dr++}down.delete('Space');
const yawA=c.yaw-yaw0;let yaw1=c.yaw;down.add('KeyA');for(let i=0;i<40;i++)step(1/60);return 'gear '+g+' hb drift frames '+dr+' yaw w/ hb '+yawA.toFixed(2)+' w/o '+(c.yaw-yaw1).toFixed(2)})()"""),
('js',"""(()=>{down.delete('KeyA');down.delete('KeyW');dispatchEvent(new KeyboardEvent('keydown',{code:'KeyC'}));return RACE.cars[0].camMode})()"""),('wait',1500),('shot','rc_cam1'),
('js',"""(()=>{dispatchEvent(new KeyboardEvent('keydown',{code:'KeyC'}));return RACE.cars[0].camMode})()"""),('wait',1500),('shot','rc_cam2'),
('js',"""(()=>{dispatchEvent(new KeyboardEvent('keydown',{code:'KeyC'}));return RACE.cars[0].camMode})()"""),('wait',1500),('shot','rc_cam3')]
run(W+'/Poly-Tourismo.html',steps,'rc')
