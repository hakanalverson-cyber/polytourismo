from shot import run,W
a="""(()=>{window.FF=n=>{for(let i=0;i<n;i++){step(1/60);hudUpdate()}};
 PT8.launch({mode:'elim',track:0,laps:99,humans:[{id:'merc',alt:0,name:'HAKAN'},{id:'ferr',alt:0}],ai:PT8.makeAI({n:3,classes:['S'],skill:.9,rally:false}),interval:20,endur:false});
 FF(60*4);const cs=RACE.cars;
 const hs=cs.filter(c=>c.human);const T=RACE.T;
 /* drafting: car2 right behind car1 */
 hs[0].sp=40;hs[1].sp=40;
 FF(30);
 const names=cs.map(c=>[c.ptName,c.cs.id,c.cs.cls]);
 return {names,groups:clusters(RACE).length,err:window.__e||null}})()"""
b="""(()=>{const hs=RACE.cars.filter(c=>c.human);const T=RACE.T;const i=hs[0].idx;
 for(let k=0;k<90;k++){const c1=hs[0],c2=hs[1];c2.x=c1.x-Math.sin(c1.yaw)*9;c2.z=c1.z-Math.cos(c1.yaw)*9;c2.y=c1.y;c2.yaw=c1.yaw;c2.vx=c1.vx;c2.vz=c1.vz;c2.sp=c1.sp;c1.in.th=1;step(1/60);hudUpdate()}
 return {draft:hs[1].draft,rings:hs[1].dfx&&hs[1].dfx.rings.filter(r=>r.m.visible).length,lines:hs[1].dfx&&hs[1].dfx.lines.filter(r=>r.m.visible).length,tag:!!hs[0].tag,list:!!document.querySelector('.h8list'),who:[...document.querySelectorAll('.h8who')].map(e=>e.textContent+'|'+e.style.display)}})()"""
c="""(()=>{for(let k=0;k<60*25;k++){step(1/60);hudUpdate()}const R=RACE;return {out:R.cars.filter(c=>c.out).map(c=>c.ptName),next:document.querySelector('.h8mode')&&document.querySelector('.h8mode').textContent}})()"""
run(W+'/Poly-Tourismo.html',[('wait',1500),('js',a),('wait',300),('js',b),('wait',300),('shot','m'),('js',c),('wait',300),('shot','e')],'hud2')
