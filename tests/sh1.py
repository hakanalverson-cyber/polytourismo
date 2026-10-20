from shot import run,W
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',1200),
('js',"(()=>{PT8.launch({mode:'ta',track:0,laps:2,humans:[{id:'merc',alt:0,name:'T'}],ai:[],tod:'day',endur:false});return 1})()"),('wait',9000),
('js',"""(()=>{const c=RACE.cars[0];const out=[];c.m.g.traverse(o=>{if(o.isMesh){const m=Array.isArray(o.material)?o.material:[o.material];out.push([o.name,o.castShadow,o.receiveShadow,m.map(x=>x.type+':'+x.transparent+':'+x.depthWrite+':'+(x.opacity)+':'+x.side).join('|'),!!o.customDepthMaterial,o.visible])}});return JSON.stringify(out)})()"""),
('shot','a')]
run(W+'/Poly-Tourismo.html',st,'sh1')
