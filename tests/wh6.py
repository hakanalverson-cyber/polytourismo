import sys,json
from shot import run,W
js="""(()=>{const bad=[];const ids=PT8.CARS.map(c=>c.id);const t0=Date.now();
function meas(w){const P=[];w.spin.children.forEach(m=>{const p=m.geometry.attributes.position;for(let i=0;i<p.count;i++)P.push([p.getX(i),p.getY(i),p.getZ(i)])});if(P.length<20)return null;let rm=0;P.forEach(q=>rm=Math.max(rm,Math.hypot(q[1],q[2])));const ring=P.filter(q=>Math.hypot(q[1],q[2])>rm*.9);if(ring.length<8)return null;
 const c=[0,0,0];ring.forEach(q=>{c[0]+=q[0];c[1]+=q[1];c[2]+=q[2]});for(let i=0;i<3;i++)c[i]/=ring.length;const C=[[0,0,0],[0,0,0],[0,0,0]];ring.forEach(q=>{const d=[q[0]-c[0],q[1]-c[1],q[2]-c[2]];for(let i=0;i<3;i++)for(let j=0;j<3;j++)C[i][j]+=d[i]*d[j]});
 const tr=C[0][0]+C[1][1]+C[2][2];let n=[1,.01,.01];for(let k=0;k<60;k++){const m=[0,0,0];for(let i=0;i<3;i++)for(let j=0;j<3;j++)m[i]+=((i===j?tr:0)-C[i][j])*n[j];const l=Math.hypot(...m)||1;n=[m[0]/l,m[1]/l,m[2]/l]}
 const ang=Math.acos(Math.min(1,Math.abs(n[0])))*57.3;
 /* distance of tread ring points from the spin axis through origin: spread = wobble */
 let mn=9,mx=0;ring.forEach(q=>{const r=Math.hypot(q[1],q[2]);mn=Math.min(mn,r);mx=Math.max(mx,r)});
 let x0=1e9,x1=-1e9;P.forEach(q=>{x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0])});return{ang,run:(mx-mn)/rm,w:x1-x0,rm}}
for(const id of ids){try{PT8.launch({mode:'ta',track:0,laps:1,humans:[{id,alt:0,name:'T'}],ai:[],tod:'day',endur:false});for(let i=0;i<4;i++)step(1/60);const m=RACE.cars[0].m;if(!m.ptWheels){bad.push(id+' nowheels');continue}
 const r=m.ptWheels.map(meas);const ws=r.map(q=>q?q.w:0);
 const flag=[];if(Math.abs(ws[0]-ws[1])>.04||Math.abs(ws[2]-ws[3])>.04)flag.push('widthLR');if(r.some(q=>q&&q.ang>3))flag.push('tilt '+r.map(q=>q&&q.ang.toFixed(1)));if(r.some(q=>q&&q.run>.12))flag.push('run '+r.map(q=>q&&q.run.toFixed(2)));
 if(flag.length)bad.push(id+' '+PT8.BYID[id].name+' ['+ws.map(v=>v.toFixed(2))+'] '+flag.join(';'))}catch(e){bad.push(id+' ERR '+e.message)}}
return (Date.now()-t0)+'ms n='+ids.length+'\\n'+bad.join('\\n')})()"""
run(W+'/Poly-Tourismo.html',[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',800),('js',js)],'wh6')
