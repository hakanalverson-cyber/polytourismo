/* ===== Poly GT layer: rally stage select pictures (Nov 8: "track selection for rally should be unique ... map previews make sense").
   P.rallyMap(i, canvas): the stage on its country's road map, drawn from the stage file itself (road network of the whole model in dim dots, the stage route in
   gold with start, finish, 1 km ticks, checkpoints, fords); P.rallyProfile(i, canvas): height along the stage. Old procedural stages (no stage file) fall back to the
   3D aerial P.stageRender makes. ===== */
(function rallyui(){
'use strict';
const P=window.PT8;if(!P)return;
const GOLD='#9cc3e8',INK='#0a0d11',PAPER='#f1f3f5',DIM='#8a949c';
const pack=i=>{const d=D[i];return d&&d.cartoon&&d.cartoon.stage?d.cartoon:null};
P.stageInfo=i=>{const pk=pack(i);if(!pk)return null;const st=pk.stage,r=st.route;let lo=1e9,hi=-1e9,up=0;for(let k=0;k<r.length;k++){lo=Math.min(lo,r[k][2]);hi=Math.max(hi,r[k][2]);if(k&&r[k][2]>r[k-1][2])up+=r[k][2]-r[k-1][2]}
 return{km:st.len/1000,lo,hi,climb:up,fords:(st.fords||[]).length,surface:pk.look&&pk.look.gravel===0?'TARMAC':(pk.id==='se-frozen-lake'?'SNOW':'GRAVEL'),name:pk.name,desc:pk.desc||''}};
function fit(cv){const dpr=Math.min(2,window.devicePixelRatio||1),w=cv.clientWidth||cv.width,h=cv.clientHeight||cv.height;if(cv.width!==Math.round(w*dpr)||cv.height!==Math.round(h*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr)}const g=cv.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);return[g,w,h]}
P.rallyMap=(i,cv)=>{const pk=pack(i);if(!pk)return false;const[g,W,H]=fit(cv),st=pk.stage,r=st.route;
 g.fillStyle='#0c1218';g.fillRect(0,0,W,H);
 let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const p of r){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[1]);z1=Math.max(z1,p[1])}
 const M=46,sx=(W-2*M)/Math.max(1,x1-x0),sz=(H-2*M)/Math.max(1,z1-z0),k=Math.min(sx,sz),ox=(W-(x1-x0)*k)/2,oz=(H-(z1-z0)*k)/2,X=x=>ox+(x-x0)*k,Y=z=>H-(oz+(z-z0)*k);
 /* faint grid */
 g.strokeStyle='#ffffff08';g.lineWidth=1;const gs=500*k;for(let x=ox%gs;x<W;x+=gs){g.beginPath();g.moveTo(x,0);g.lineTo(x,H);g.stroke()}for(let y=(H-oz)%gs;y<H;y+=gs){g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke()}
 /* the whole map's roads */
 const net=st.net;if(net&&net.length){g.fillStyle='#3a434d';const s=Math.max(1.3,Math.min(2.4,k*7));for(let a=0;a<net.length;a+=2){const x=X(net[a]),y=Y(net[a+1]);if(x<-4||y<-4||x>W+4||y>H+4)continue;g.fillRect(x-s/2,y-s/2,s,s)}}
 /* the stage: dark outline, gold line */
 g.lineJoin='round';g.lineCap='round';
 for(const[w,c]of[[9,INK],[4,GOLD]]){g.strokeStyle=c;g.lineWidth=w;g.beginPath();r.forEach((p,j)=>j?g.lineTo(X(p[0]),Y(p[1])):g.moveTo(X(p[0]),Y(p[1])));g.stroke()}
 /* kilometre ticks */
 g.font='700 10px "PT Inter",monospace';g.textAlign='center';g.textBaseline='middle';
 {let d=0,next=1000;for(let j=1;j<r.length;j++){d+=Math.hypot(r[j][0]-r[j-1][0],r[j][1]-r[j-1][1]);if(d>=next){const q=r[j];g.fillStyle=INK;g.beginPath();g.arc(X(q[0]),Y(q[1]),9,0,7);g.fill();g.strokeStyle=PAPER;g.lineWidth=1.3;g.stroke();g.fillStyle=PAPER;g.fillText(next/1000,X(q[0]),Y(q[1])+.5);next+=1000}}}
 /* fords */
 for(const f of st.fords||[]){const x=X(f.x),y=Y(f.z);g.fillStyle='#1b5a7a';g.strokeStyle='#bfe8ff';g.lineWidth=1.6;g.beginPath();g.rect(x-12,y-7,24,14);g.fill();g.stroke();g.fillStyle='#fff';g.font='700 8px "PT Inter",monospace';g.fillText('FORD',x,y+.5)}
 /* start and finish */
 const lab=(p,t,dx,dy)=>{const x=X(p[0]),y=Y(p[1]);g.font='700 10px "PT Inter",monospace';g.textAlign='left';const w=g.measureText(t.split('').join(' ')).width+14;if(x+dx+w>W-6)dx=-12-w;if(y+dy+9>H-6)dy=-Math.abs(dy);g.fillStyle='#0a0d11e6';g.strokeStyle=PAPER;g.lineWidth=1;g.fillRect(x+dx,y+dy-9,w,18);g.strokeRect(x+dx+.5,y+dy-8.5,w-1,17);g.fillStyle=GOLD;g.fillText(t.split('').join(' '),x+dx+7,y+dy+.5)};
 {const a=r[0],b=r[r.length-1];
  for(const[p,c]of[[a,'#7fd68a'],[b,PAPER]]){g.fillStyle=INK;g.beginPath();g.arc(X(p[0]),Y(p[1]),8,0,7);g.fill();g.fillStyle=c;g.beginPath();g.arc(X(p[0]),Y(p[1]),5,0,7);g.fill()}
  /* finish: chequer */{const x=X(b[0]),y=Y(b[1]);for(let u=0;u<2;u++)for(let v=0;v<2;v++){g.fillStyle=(u+v)&1?INK:PAPER;g.fillRect(x-4+u*4,y-4+v*4,4,4)}}
  lab(a,'START',12,-14);lab(b,'FINISH',12,14)}
 /* north arrow and scale */
 g.fillStyle=DIM;g.font='700 9px "PT Inter",monospace';g.textAlign='center';g.fillText('N',W-24,18);g.strokeStyle=DIM;g.lineWidth=1.4;g.beginPath();g.moveTo(W-24,40);g.lineTo(W-24,26);g.moveTo(W-28,31);g.lineTo(W-24,26);g.lineTo(W-20,31);g.stroke();
 {const m=1000*k;g.strokeStyle=PAPER;g.lineWidth=2;g.beginPath();g.moveTo(18,H-20);g.lineTo(18+m,H-20);g.moveTo(18,H-24);g.lineTo(18,H-16);g.moveTo(18+m,H-24);g.lineTo(18+m,H-16);g.stroke();g.fillStyle=PAPER;g.textAlign='left';g.fillText('1 KM',24+m,H-20)}
 return true};
P.rallyProfile=(i,cv)=>{const pk=pack(i);if(!pk)return false;const[g,W,H]=fit(cv),r=pk.stage.route;
 g.clearRect(0,0,W,H);let lo=1e9,hi=-1e9;for(const p of r){lo=Math.min(lo,p[2]);hi=Math.max(hi,p[2])}const pad=Math.max(6,(hi-lo)*.12);lo-=pad;hi+=pad;
 const dist=[0];for(let j=1;j<r.length;j++)dist.push(dist[j-1]+Math.hypot(r[j][0]-r[j-1][0],r[j][1]-r[j-1][1]));const L=dist[dist.length-1],L0=34,B=20,T0=8,X=d=>L0+(W-L0-8)*d/L,Y=h=>H-B-(H-B-T0)*(h-lo)/(hi-lo);
 g.strokeStyle='#ffffff10';g.fillStyle=DIM;g.font='700 9px "PT Inter",monospace';g.textAlign='right';g.textBaseline='middle';
 for(let q=0;q<=3;q++){const h=lo+(hi-lo)*q/3,y=Y(h);g.beginPath();g.moveTo(L0,y);g.lineTo(W-8,y);g.stroke();g.fillText(Math.round(h)+'',L0-6,y)}
 g.textAlign='center';for(let k=0;k<=L;k+=1000){g.fillText(k/1000+'',X(k),H-8)}
 const gr=g.createLinearGradient(0,T0,0,H-B);gr.addColorStop(0,'#9cc3e855');gr.addColorStop(1,'#9cc3e800');g.fillStyle=gr;g.beginPath();g.moveTo(X(0),H-B);r.forEach((p,j)=>g.lineTo(X(dist[j]),Y(p[2])));g.lineTo(X(L),H-B);g.closePath();g.fill();
 g.strokeStyle=GOLD;g.lineWidth=2;g.lineJoin='round';g.beginPath();r.forEach((p,j)=>j?g.lineTo(X(dist[j]),Y(p[2])):g.moveTo(X(dist[j]),Y(p[2])));g.stroke();
 return true};
/* ---- no lag spikes: nothing on a stage is built, decoded or uploaded while you drive ----
   P.warmStagePacks(): builds every stage's meshes and starts the texture decode; runs behind the rally loading screen.
   P.warmScene(Rc): draws the whole stage once at a tiny size with culling off (behind the black fade at the start), so every tile's geometry and
   texture is already on the graphics card when it first comes into view. */
P.warmStagePacks=()=>{for(let i=0;i<D.length;i++){const pk=pack(i);if(pk&&P.warmPack)P.warmPack(pk)}};
P.warmScene=Rc=>{try{if(!Rc||!Rc.scene||!Rc.T||!Rc.T.stage||typeof R==='undefined')return;const sc=Rc.scene,T=Rc.T,saved=[];
 sc.traverse(o=>{if(o.isMesh||o.isSprite||o.isPoints||o.isLine){saved.push([o,o.visible,o.frustumCulled]);o.visible=true;o.frustumCulled=false}});
 const cam=new THREE.PerspectiveCamera(60,16/9,1,200000),k=Math.floor((T.finI||T.N)/2);cam.position.set(T.x[k],T.y[k]+400,T.z[k]);cam.lookAt(T.x[k],T.y[k],T.z[k]);
 const vp=new THREE.Vector4(),st=R.getScissorTest();R.getViewport(vp);
 R.setScissorTest(false);R.setViewport(0,0,48,27);R.render(sc,cam);R.setViewport(vp.x,vp.y,vp.z,vp.w);R.setScissorTest(st);
 for(const[o,v,f]of saved){o.visible=v;o.frustumCulled=f}}catch(e){console.warn('warmScene',e)}};
/* the 3D aerial pictures are for the old procedural stages only: a stage file has its own map (never build the whole model just for a menu picture) */
{const sr=P.stageRender,sc=P.stageCached;P.stageRender=i=>pack(i)?Promise.resolve(null):sr(i);P.stageCached=i=>pack(i)?null:sc(i)}
})();
