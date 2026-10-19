from shot import run,W
steps=[('wait',800),('js',"""(()=>{PT8.ui.openCards();document.querySelector('[data-m=rally]').click();PT8.ui.ST.players=1;PT8.ui.ST.track=10;PT8.ui.renderSetup();document.getElementById('suGo').click();return 1})()"""),('wait',9000),
('js',"""(()=>{document.getElementById('rlPlay').click();for(let i=0;i<60*6;i++)step(1/60);const c=RACE.cars[0],o={};
const run1=(frac)=>{c.vx=c.vz=0;c.sp=0;c.rg=0;c.gear=0;const t0=RACE.t;let t100=0,t150=0;down.add('KeyW');for(let i=0;i<60*60;i++){step(1/60);const G=PT8.GT(c.cs),top=c.cs.top*G[c.rg].top*(c.mt?c.mt.top:1);if(c.sp>top*frac&&c.rg<G.length-1)dispatchEvent(new KeyboardEvent('keydown',{code:'KeyE'}));if(!t100&&c.sp*3.6>100)t100=RACE.t-t0;if(!t150&&c.sp*3.6>150){t150=RACE.t-t0;break}}down.delete('KeyW');return [+t100.toFixed(1),+t150.toFixed(1),Math.round(c.sp*3.6)]};
o.real=run1(.9);PT8.rallyGears(false);o.three=run1(.9);PT8.rallyGears(true);return JSON.stringify(o)})()""")]
run(W+'/Poly-Tourismo.html',steps,'gc')
