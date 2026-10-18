from shot import run,W
run(W+'/Poly-Tourismo.html',[('js','''(()=>{const out={};for(const hv of ['light','heavy']){PT8.launch({mode:'cutup',track:1,time:90,humans:[{id:'merc',alt:0}],ai:[],traffic:hv});const Rc=RACE;let ov=0,minD=1e9,n=Rc.traffic.length;const c=Rc.cars[0];
 for(let i=0;i<60*70;i++){c.in={th:.6,br:0,st:0,hb:0};step(1/60);if(Rc.state==='race'&&Rc.t>1&&i%6==0){const L=Rc.traffic;for(let a=0;a<L.length;a++)for(let b=a+1;b<L.length;b++){const A=L[a],B=L[b];if(A.hit>0||B.hit>0)continue;if(PT8.obbHit(A.x,A.z,A.yaw,B.x,B.z,B.yaw,.9,2.0))ov++}}}
 out[hv]={n,overlapSamples:ov,crashes:c.crashes,score:c.score};PT8.cleanupRace()}return JSON.stringify(out)})()''')],'tr')
