/* ===== layer: finishing sequence for every mode. The race is recorded as it is driven (all cars, 20 Hz). When it ends, a montage of
   cameras plays it back: trackside fly-bys, corner shots from the outside of the bend, a helicopter orbit and a low chase, cycling
   between the winner and the human drivers, while a GT-style position list on the left shows rank, a preview of the car, the driver
   and the time. Enter, Space, Esc or a click skips to the results. ===== */
(function finale(){
'use strict';
const P=window.PT8;if(!P)return;
const css=document.createElement('style');css.textContent=`
body.finale #huds,body.finale #hud,body.finale .hud,body.finale #h8pace,body.finale .h8pace,body.finale #mini,body.finale #mm,body.finale #dtm,body.finale #touch,body.finale #cd,body.finale #rlDash,body.finale #pause,body.finale .gxPh{display:none!important}
#fnL{position:fixed;left:22px;top:50%;transform:translateY(-50%);z-index:30;width:clamp(250px,25vw,340px);display:none;font-family:var(--gt,Inter,sans-serif);color:#fff;pointer-events:none}
#fnL.on{display:block}
#fnL h4{margin:0 0 10px 2px;font:italic 800 11px var(--gt);letter-spacing:.34em;color:#cfd8de;text-shadow:0 1px 3px #000c}
#fnL h4 b{display:block;font:italic 800 22px var(--gt);letter-spacing:.06em;color:#fff;margin-top:3px}
.fnr{display:flex;align-items:center;gap:10px;height:56px;margin-bottom:6px;padding:0 12px 0 0;border-radius:3px;position:relative;overflow:hidden;
 background:linear-gradient(90deg,#0a0d12e8,#10161dcc 70%,#10161d99);border:1px solid #ffffff22;border-left:3px solid #ffffff55;box-shadow:0 3px 14px #0008,inset 0 1px 0 #ffffff26;
 transform:translateX(-120%);opacity:0;transition:transform .45s cubic-bezier(.2,.8,.2,1),opacity .3s,background .25s,border-color .25s}
.fnr.in{transform:none;opacity:1}
.fnr:before{content:"";position:absolute;inset:0 0 50% 0;background:linear-gradient(#ffffff1c,#ffffff00);pointer-events:none}
.fnr .rk{width:44px;text-align:center;font:italic 800 26px var(--gt);color:#fff;text-shadow:0 2px 6px #000a;flex:none}
.fnr .rk small{font-size:11px;margin-left:1px;opacity:.7}
.fnr .im{width:92px;height:100%;flex:none;background-size:cover;background-position:center;mask-image:linear-gradient(90deg,transparent,#000 22%,#000 82%,transparent);-webkit-mask-image:linear-gradient(90deg,transparent,#000 22%,#000 82%,transparent)}
.fnr .tx{flex:1;min-width:0;line-height:1.15}
.fnr .tx b{display:block;font:italic 800 14px var(--gt);letter-spacing:.05em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-transform:uppercase}
.fnr .tx span{display:block;font:600 10px var(--gt);letter-spacing:.14em;color:#aab6bf;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-transform:uppercase}
.fnr .tm{font:italic 700 13px var(--gt);letter-spacing:.03em;color:#e9eef2;flex:none;text-align:right}
.fnr.hu{border-left-color:var(--c,#9fd8ff)}
.fnr.hu .tx span{color:var(--c,#9fd8ff)}
.fnr.p1{border-left-color:#f2c76b}.fnr.p1 .rk{color:#f2c76b}
.fnr.cam{background:linear-gradient(90deg,#1c2a38f2,#223646d0 70%,#223646aa);border-color:#9fd8ff88;transform:translateX(10px)}
#fnB{position:fixed;inset:0;background:#000;opacity:0;pointer-events:none;z-index:29}
#fnS{position:fixed;right:24px;bottom:20px;z-index:31;font:700 11px var(--gt);letter-spacing:.24em;color:#cfd8de;text-shadow:0 1px 3px #000;display:none}
#fnS.on{display:block}
#fnT{position:fixed;left:0;right:0;bottom:0;height:3px;z-index:31;background:#ffffff22;display:none}#fnT i{display:block;height:100%;background:#fff;width:0}
#fnV{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:30;font:italic 800 12px var(--gt);letter-spacing:.34em;color:#fff;text-shadow:0 1px 4px #000;display:none;opacity:.85}
`;document.head.appendChild(css);
const el=document.createElement('div');el.id='fnL';document.body.appendChild(el);
const blk=document.createElement('div');blk.id='fnB';document.body.appendChild(blk);
const sk=document.createElement('div');sk.id='fnS';sk.textContent='ENTER  SKIP';document.body.appendChild(sk);
const bar=document.createElement('div');bar.id='fnT';bar.innerHTML='<i></i>';document.body.appendChild(bar);
const vw=document.createElement('div');vw.id='fnV';document.body.appendChild(vw);
const PC=['#9fd8ff','#ffb347','#8ef08a','#ff7a9a'];
const HZ=20;let rec=null,recFor=null,lastS=-1;
let F=null;
const cam=new THREE.PerspectiveCamera(50,1,.2,3500);
const wrp=a=>Math.atan2(Math.sin(a),Math.cos(a));
/* ---------------- recorder ---------------- */
const step0=step;
step=function(dt){
 const Rc=RACE;
 if(F)return;/* the sim waits while the montage plays */
 const r=step0.apply(this,arguments);
 try{if(Rc&&Rc.state==='race'&&Rc.cars&&Rc.cars.length){
  if(recFor!==Rc||Rc.t<lastS-1){recFor=Rc;rec=Rc.cars.map(()=>[]);lastS=-1}
  if(Rc.t>=lastS+1/HZ){lastS=Rc.t;Rc.cars.forEach((c,i)=>{rec[i].push([Rc.t,c.x,c.y,c.z,c.yaw,c.pitch||0,c.roll||0,c.unw||0,c.sp||0])})}
 }}catch(e){}
 return r};
function sample(i,t){const a=rec[i];if(!a.length)return null;if(t<=a[0][0])return a[0];if(t>=a[a.length-1][0])return a[a.length-1];
 let lo=0,hi=a.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(a[m][0]<=t)lo=m;else hi=m}
 const p=a[lo],q=a[hi],u=(t-p[0])/Math.max(1e-6,q[0]-p[0]),o=new Array(9);o[0]=t;for(let k=1;k<9;k++)o[k]=p[k]+(q[k]-p[k])*u;o[4]=p[4]+wrp(q[4]-p[4])*u;o[5]=p[5]+wrp(q[5]-p[5])*u;o[6]=p[6]+wrp(q[6]-p[6])*u;return o}
/* ---------------- ranking ---------------- */
function order(Rc){const cs=Rc.cars.map((c,i)=>({c,i}));
 if(Rc.mode==='cutup')cs.sort((a,b)=>(b.c.score||0)-(a.c.score||0));
 else cs.sort((a,b)=>(b.c.fin?1e6-b.c.finT:0)-(a.c.fin?1e6-a.c.finT:0)||b.c.unw-a.c.unw);
 return cs}
const ordn=n=>n+(['th','st','nd','rd'][(n%100>10&&n%100<14)?0:(n%10<4?n%10:0)]);
/* ---------------- shots ---------------- */
function corners(T){const K=P.kappa(T),N=T.N,ap=new Uint8Array(N);for(let i=0;i<N;i++){const R_=1/Math.max(K[i],1e-4);if(R_>=95)continue;let mx=true;for(let d=-8;d<=8;d++)if(K[((i+d)%N+N)%N]>K[i]){mx=false;break}if(mx)for(let d=-4;d<=4;d++)ap[((i+d)%N+N)%N]=1}return ap}
function build(Rc,ord){
 const T=Rc.T,N=T.N,ap=corners(T),sh=[];
 const t0=rec[0][0][0],t1=Math.max(...rec.map(a=>a.length?a[a.length-1][0]:0));
 const hum=ord.filter(o=>o.c.human),win=ord[0],second=ord[1]||ord[0],h1=hum[0]||win,h2=hum[1]||second;
 let rn=17;const rr=()=>{rn=(rn*1103515245+12345)&0x7fffffff;return rn/0x7fffffff};
 const span=t1-t0,at=f=>t0+span*f;
 function cornerT(i,f){/* first time after fraction f when car i is at a corner apex */
  const a=rec[i];let s0=Math.max(0,Math.floor(a.length*f));for(let s=s0;s<a.length-8;s++){const u=Math.floor(a[s][7]),ix=((u%N)+N)%N;if(u>5&&ap[ix]&&a[s][8]>6)return a[s][0]}
  for(let s=0;s<s0&&s<a.length-8;s++){const u=Math.floor(a[s][7]),ix=((u%N)+N)%N;if(u>5&&ap[ix]&&a[s][8]>6)return a[s][0]}return null}
 const add=(kind,o,t,d)=>sh.push({kind,o,t,d:d||3.4});
 const wi=win.i,w2=second.i,hi=h1.i,hj=h2.i;
 const fin=c=>c.finT!=null&&c.fin?Math.min(c.finT,t1):t1;
 add('fly',win,fin(win.c)-1.5,3.6);
 {const t=cornerT(wi,.55);if(t!=null)add('corner',win,t);else add('heli',win,at(.5))}
 add('heli',second,at(.78));
 {const t=cornerT(hi,.3);if(t!=null)add('corner',h1,t);else add('fly',h1,at(.35))}
 add('fly',h2===h1?second:h2,at(.62));
 add('chase',h1,at(.9),3.2);
 {const t=cornerT(hj,.7);if(t!=null)add('corner',h2===h1?win:h2,t);else add('heli',h1,at(.7))}
 add('heli',h1,t1-1.2,3.8);
 return sh}
function place(Rc,s,u){/* camera for shot s at local time u (0..d) */
 const T=Rc.T,i=s.o.i,k=s.k,tt=s.t+u*(s.slow||.92);let c=sample(i,tt);if(!c)return null;
 let p,l,fov=50;const sy=Math.sin(c[4]),cy=Math.cos(c[4]);
 if(s.kind==='fly'){if(!s.cp){const a=sample(i,s.t+1.7)||c,bb=sample(i,s.t+2.2)||a,ix=((Math.round(a[7])%T.N)+T.N)%T.N,hw=(T.hw&&T.hw[ix])||7,d=Math.hypot(bb[1]-a[1],bb[3]-a[3])||1,fx=(bb[1]-a[1])/d,fz=(bb[3]-a[3])/d,side=(Math.round(s.t*7)&1)?1:-1,off=hw+5+(Math.round(s.t*3)%4);s.cp=[a[1]+fz*side*off,a[2]+1.5,a[3]-fx*side*off]}
  p=s.cp;l=[c[1],c[2]+.6,c[3]];fov=34}
 else if(s.kind==='corner'){if(!s.cp){const A=sample(i,s.t-1.1),B=sample(i,s.t+1.1),M=sample(i,s.t),d1x=M[1]-A[1],d1z=M[3]-A[3],d2x=B[1]-M[1],d2z=B[3]-M[3],cr=d1x*d2z-d1z*d2x,L=Math.hypot(d1x,d1z)||1,nx=d1z/L,nz=-d1x/L,sg=cr<0?1:-1;/* centre of the bend is on side sg; stand opposite */
   const o=-sg,ox=nx*o,oz=nz*o;s.cp=[M[1]+ox*15+d1x/L*-4,M[2]+1.7,M[3]+oz*15+d1z/L*-4]}
  p=s.cp;l=[c[1],c[2]+.6,c[3]];fov=36}
 else if(s.kind==='heli'){const a=u*.35+(s.t*.37%6.28);p=[c[1]+Math.sin(a)*34,c[2]+17,c[3]+Math.cos(a)*34];l=[c[1]+sy*5,c[2],c[3]+cy*5];fov=48}
 else{const sw=Math.sin(u*1.4)*.8;p=[c[1]-sy*7.5+cy*sw,c[2]+2.2,c[3]-cy*7.5-sy*sw];l=[c[1]+sy*10,c[2]+.7,c[3]+cy*10];fov=62}
 const g=T.surf(p[0],p[2],p[1]+3).h+1;if(p[1]<g)p[1]=g;
 return{p,l,fov}}
/* ---------------- list ---------------- */
function paint(Rc,ord){const cm=Rc.mode==='cutup',pl=P.fmtT||(t=>t.toFixed(2));
 const w=ord[0].c;
 el.innerHTML='<h4>'+(Rc.cfg&&Rc.cfg.rally?'STAGE':cm?'SCORE':'FINAL')+'<b>'+(cm?'RESULTS':'CLASSIFICATION')+'</b></h4>'+ord.slice(0,8).map((o,n)=>{const c=o.c;let th='';try{th=P.carThumb?P.carThumb(c.carId):''}catch(e){}
  const hi=c.human?c.pi!=null?c.pi:ord.filter(q=>q.c.human).indexOf(o):0,car=P.BYID&&P.BYID[c.carId]?P.BYID[c.carId].name:'';
  const tm=cm?(c.score||0).toLocaleString('en-US')+' PTS':c.fin?(n===0?pl(c.finT):'+'+(c.finT-w.finT).toFixed(2)):(Rc.mode==='elim'?(c.txt||'OUT'):'DNF');
  return '<div class="fnr'+(c.human?' hu':'')+(n===0?' p1':'')+'" data-i="'+o.i+'" style="--c:'+PC[hi%4]+'"><div class="rk">'+(n+1)+'<small>'+ordn(n+1).slice(-2)+'</small></div><div class="im" style="background-image:url('+th+')"></div><div class="tx"><b>'+(c.ptName||'DRIVER')+'</b><span>'+car+'</span></div><div class="tm">'+tm+'</div></div>'}).join('');
 el.classList.add('on')}
/* ---------------- run ---------------- */
function begin(Rc){
 if(!rec||!rec[0]||rec[0].length<30||recFor!==Rc)return false;
 const ord=order(Rc).filter(o=>rec[o.i]&&rec[o.i].length);if(!ord.length)return false;
 F={Rc,ord,sh:build(Rc,ord),k:-1,u:0,tot:0};
 F.sh.forEach((s,k)=>{s.k=k});F.dur=F.sh.reduce((a,s)=>a+s.d,0);
 document.body.classList.add('finale');paint(Rc,ord);
 /* reveal last place first */
 const rows=[...el.querySelectorAll('.fnr')];rows.reverse().forEach((r,n)=>setTimeout(()=>{if(F)r.classList.add('in')},350+n*260));
 sk.classList.add('on');bar.style.display='block';vw.style.display='block';
 return true}
function end(){if(!F)return;const Rc=F.Rc;F=null;document.body.classList.remove('finale');el.classList.remove('on');el.innerHTML='';sk.classList.remove('on');bar.style.display='none';vw.style.display='none';blk.style.transition='none';blk.style.opacity=0;
 /* put the cars back where they ended */
 try{Rc.cars.forEach((c,i)=>{const a=rec[i];if(a&&a.length){const q=a[a.length-1];/* the cars keep their last simulated state; nothing to restore */}})}catch(e){}
 const f=P._finaleNext;P._finaleNext=null;if(f)f()}
const dr0=drawRace;
drawRace=function(dt){
 if(!F)return dr0.apply(this,arguments);
 const Rc=F.Rc;if(RACE!==Rc){end();return dr0.apply(this,arguments)}
 const W=R.domElement.width,H=R.domElement.height;F.tot+=dt;
 /* which shot */
 let acc=0,k=0;for(;k<F.sh.length;k++){if(F.tot<acc+F.sh[k].d)break;acc+=F.sh[k].d}
 if(k>=F.sh.length){end();return}
 const s=F.sh[k],u=F.tot-acc;
 if(k!==F.k){F.k=k;blk.style.transition='none';blk.style.opacity=1;requestAnimationFrame(()=>requestAnimationFrame(()=>{blk.style.transition='opacity .28s';blk.style.opacity=0}));
  el.querySelectorAll('.fnr').forEach(r=>r.classList.toggle('cam',+r.dataset.i===s.o.i));
  vw.textContent={fly:'TRACKSIDE',corner:'CORNER',heli:'HELICOPTER',chase:'CHASE CAM'}[s.kind]||''}
 /* last second of a shot fades out */
 if(s.d-u<.22&&k<F.sh.length-1){blk.style.transition='opacity .2s';blk.style.opacity=1}
 /* cars at the recorded moment */
 const tt=s.t+u*(s.slow||.92);
 Rc.cars.forEach((c,i)=>{const q=sample(i,tt);if(!q)return;c.x=q[1];c.y=q[2];c.z=q[3];c.yaw=q[4];c.pitch=q[5];c.roll=q[6];c.sp=q[8];c.respT=0;try{updateVisual(c,Rc.T,1)}catch(e){}});
 const sp=place(Rc,s,u);if(!sp){end();return}
 cam.position.set(sp.p[0],sp.p[1],sp.p[2]);cam.lookAt(sp.l[0],sp.l[1],sp.l[2]);cam.fov=sp.fov;cam.aspect=Math.max(.1,W/H);cam.updateProjectionMatrix();
 R.setScissorTest(false);R.setViewport(0,0,W,H);R.clear();R.render(Rc.scene,cam);
 bar.firstChild.style.width=(100*F.tot/F.dur)+'%'};
addEventListener('keydown',e=>{if(!F)return;if(['Enter','Space','Escape','NumpadEnter'].includes(e.code)){e.preventDefault();e.stopImmediatePropagation();end()}},true);
addEventListener('mousedown',e=>{if(F){e.stopImmediatePropagation();end()}},true);
addEventListener('touchstart',e=>{if(F)end()},true);
/* ---------------- hook ---------------- */
function wrapShow(){
 const sr=P.showResults;if(!sr||sr._fin)return;
 const w=function(){const Rc=RACE,self=this,args=arguments;
  if(Rc&&!F&&!Rc.__fin&&Rc.cfg&&!Rc.cfg.freeroam&&!(Rc.cfg.rally&&P.rallyMid&&P.rallyMid())&&begin(Rc)){Rc.__fin=1;P._finaleNext=()=>sr.apply(self,args);return}
  return sr.apply(this,arguments)};
 w._fin=1;P.showResults=w}
setTimeout(wrapShow,60);
P.finaleActive=()=>!!F;P.finaleSkip=()=>end();
})();
