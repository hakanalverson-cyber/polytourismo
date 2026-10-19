from shot import run,W
steps=[('wait',800),('js',"""(()=>{const o={};for(const id of PT8.STAGES){const T=sampleTrack(D[id]);const sc=buildWorld(T);o[id]=T.solids.length}return JSON.stringify(o)})()"""),
('js',"""(()=>{PT8.ui.openCards();document.querySelector('[data-m=rally]').click();PT8.ui.ST.players=1;PT8.ui.ST.track=13;PT8.ui.renderSetup();document.getElementById('suGo').click();return 1})()"""),('wait',16000),
('js',"""(()=>{document.getElementById('rlPlay').click();const c=RACE.cars[0],T=RACE.T;c.forceAI=1;c.ai={skill:1,lat:0,name:'T'};for(let i=0;i<60*400;i++){step(1/60);if(c.unw*T.sp>900)break}
const ai='AI to 900 m dmg '+(c.dmg||0)+' pen '+(RACE.pen||0);
c.forceAI=0;const s=T.solids.map(q=>[q,Math.min(...[...Array(T.N).keys()].filter(i=>i%2===0).map(i=>Math.hypot(T.x[i]-q[0],T.z[i]-q[1])))]).filter(x=>x[1]>4&&x[1]<10)[0][0];
// put car 40 m before the solid along direction, aimed at it, 30 m/s
let bi=0,bd=1e9;for(let i=0;i<T.N;i++){const d=Math.hypot(T.x[i]-s[0],T.z[i]-s[1]);if(d<bd){bd=d;bi=i}}
const ang=Math.atan2(s[0]-T.x[bi],s[1]-T.z[bi]);c.x=s[0]-Math.sin(ang)*30;c.z=s[1]-Math.cos(ang)*30;c.y=T.terr(c.x,c.z)+1.3;c.yaw=ang;c.vx=Math.sin(ang)*30;c.vz=Math.cos(ang)*30;c.vy=0;down.add('KeyW');
for(let k=0;k<60*3;k++)step(1/60);down.delete('KeyW');
return ai+' | solid r '+s[2].toFixed(2)+' after hit dmg '+(c.dmg||0).toFixed(2)+' hits '+(c.hits||0)+' sp '+Math.round(c.sp*3.6)})()"""),('wait',1500),('shot','dm')]
run(W+'/Poly-Tourismo.html',steps,'dm')
