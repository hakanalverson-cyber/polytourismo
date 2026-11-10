/* ===== Poly GT layer: live race prep (Nov 9, Hakan: "make the preparation stages for all modes more immersive, not just some boxes you click on").
   The setup screen used to be a still picture in a box with option cards under it. Now the whole screen behind the options is the real
   track, rendered live with its own renderer:
   - part 1 (the race): a slow aerial orbit that shows the whole layout, then drone shots that cut between corners (flying along the road,
     a trackside pan, a low run down the road, a high drone), with the sky, clouds and time of day you have picked (switch Time of day and
     the view changes with it)
   - part 2 (the car): your car (every player's car, side by side) parked on the grid of that track, the camera circling it slowly; drag on
     the picture to turn it yourself
   The option cards turn to frosted glass over it. The old still picture is kept underneath as the fallback (PTO.prepLive=false turns
   the live view off), and the world is freed the moment a race starts or the setup is left. ===== */
(function prep(){
'use strict';
const P=window.PT8;if(!P||typeof THREE==='undefined'||typeof R==='undefined'||typeof buildWorld==='undefined')return;
const on=()=>!window.PTO||window.PTO.prepLive!==false;
const FAST=()=>!window.PTO||window.PTO.prepFast!==false;
let lastDraw=0,fcount=0;
const $=id=>document.getElementById(id);
const GBf=(T,x,z)=>{try{return window.GB?window.GB(T,x,z):(T.terr?T.terr(x,z):0)}catch(e){return 0}};
const st=document.createElement('style');st.textContent=`
#prepCv{position:absolute;inset:0;width:100%;height:100%;z-index:0;opacity:0;transition:opacity .5s ease;pointer-events:none;display:block}
#s8setup.prepLive #prepCv{opacity:1}
#s8setup.prepLive #prepCv.cut{opacity:0;transition:opacity .22s ease}
#prepVig{position:absolute;inset:0;z-index:1;pointer-events:none;opacity:0;transition:opacity .5s;background:radial-gradient(ellipse 90% 80% at 60% 35%,#0000 40%,#0006 100%),linear-gradient(90deg,#0008 0%,#0003 30%,#0000 50%),linear-gradient(0deg,#000c 0%,#0007 30%,#0000 55%)}
#s8setup.prepLive #prepVig{opacity:1}
#s8setup.prepLive::before{opacity:0!important}
/* Nov 10 (Hakan: "the race preparation phase is the same terrible text boxes"): over the live track the three boxed cards become a row of glass pills
   (small label over a big value) along the bottom edge, with no card frames and no list rows (PTO.prepPills===false: the old cards) */
#s8setup.prepLive.pillOn #gxSu.g2 .gxCards{display:flex!important;flex-wrap:wrap;align-items:flex-end;gap:8px 10px;max-height:none!important;padding:0 clamp(22px,3vw,48px) clamp(10px,1.6vh,22px)}
#s8setup.prepLive.pillOn #gxSu.g2 .gxCards .gxCard{display:contents!important}
#s8setup.prepLive.pillOn #gxSu.g2 .gxCards:not(.g4) .gxCard h5{display:none}
#s8setup.prepLive.pillOn #gxSu.g2 .gxCards.g4 .gxCard h5{display:inline-flex;align-items:center;gap:7px;margin:0 2px 0 0!important;padding:6px 4px;font:600 10px var(--gt);letter-spacing:.22em;text-transform:uppercase;color:#8fb4d8}
#s8setup.prepLive.pillOn #gxSu.g2 .gxCards.g4 .gxCard.empty .gxr.gxAddT{flex-direction:row;gap:10px;min-height:0;padding:9px 18px;border-radius:14px!important;background:#0a0e1466;box-shadow:inset 0 1px 0 #ffffff26,0 0 0 1px #ffffff1c;font:500 12px var(--gt);letter-spacing:.14em;text-transform:uppercase}
#s8setup.prepLive.pillOn #gxSu.g2 .gxCards.g4 .gxCard.empty .gxr.gxAddT small{display:none}
#s8setup.prepLive.pillOn #gxSu.g2 .gxCards.g4 .gxCard.empty .gxr.gxAddT{flex:0 0 auto!important;width:auto!important;height:auto!important;min-height:0!important;max-height:none!important;border:0!important;margin:0!important;align-self:flex-end}
#s8setup.prepLive.pillOn #gxSu.g2 .gxCards.g4 .gxr{padding:6px 14px 7px!important}
#s8setup.prepLive.pillOn #gxSu.g2 .gxCards.g4 .gxr input{width:104px!important;padding:3px 8px!important;min-height:0!important;height:24px!important}
#s8setup.prepLive.pillOn #gxSu.g2 .gxCards.g4{overflow:visible!important;gap:6px 8px!important;align-items:center!important}
#s8setup.prepLive.pillOn #gxSu.g2 .gxCards.g4 .gxCard.empty{border:0!important;background:none!important;min-height:0!important}
#s8setup.prepLive.pillOn #gxSu.g2 .gxCards .gxOpts{display:contents!important}
#s8setup.prepLive.pillOn #gxSu.g2 .gxCards .gxr{flex-direction:column;align-items:flex-start;justify-content:center;gap:1px;min-height:0!important;padding:8px 18px 9px!important;margin:0!important;border-radius:14px!important;background:#0a0e1480;backdrop-filter:blur(10px);box-shadow:inset 0 1px 0 #ffffff26,0 0 0 1px #ffffff1c,0 8px 20px #0006}
#s8setup.prepLive.pillOn #gxSu.g2 .gxCards .gxr .l{font:600 10px var(--gt)!important;letter-spacing:.2em;text-transform:uppercase;color:#8fb4d8}
#s8setup.prepLive.pillOn #gxSu.g2 .gxCards .gxr .v{margin:0!important;font:400 clamp(15px,2.1vh,22px) var(--gt);gap:8px}
#s8setup.prepLive.pillOn #gxSu.g2 .gxCards .gxr.on{background:linear-gradient(180deg,#8fb4d8e0 0%,#4f7eabe8 48%,#33608ce8 52%,#4a77a3e8 100%)}
#s8setup.prepLive.pillOn #gxSu.g2 .gxCards .gxr.on .l{color:#e6f0fa}
/* car step, idle: only the cars, centred, with a hint; zoomed: the frame on the left (name, stats, change car, name, gearbox) */
#prepHint,#prepZoomX{display:none}
#s8setup.carIdle #prepHint{display:block;position:absolute;left:0;right:0;bottom:clamp(16px,4vh,44px);text-align:center;font:600 11px var(--gt);letter-spacing:.3em;text-transform:uppercase;color:#aebfd0;text-shadow:0 1px 8px #000;pointer-events:none;z-index:3}

.gxPanels{position:absolute;inset:0;pointer-events:none;display:none;z-index:3}
#s8setup.carIdle .gxPanels{display:block}
.gxP{position:absolute;top:clamp(8px,2vh,22px);bottom:clamp(58px,9vh,92px);width:min(400px,calc((100vw - 60px)/var(--n,1) - 18px));display:flex;flex-direction:column;gap:5px;left:20px;color:#eef3f8}
.gxPH{display:flex;align-items:center;justify-content:space-between;min-height:46px}
.gxPH b{display:grid;place-items:center;width:38px;height:38px;border-radius:10px;background:#0a0e1499;box-shadow:inset 0 1px 0 #ffffff2a,0 0 0 1px #ffffff26;font:600 18px var(--gt)}
.gxPH{gap:10px}.gxPH .gxPL{margin-left:auto}.gxPG{pointer-events:auto;display:grid;place-items:center;width:38px;height:38px;padding:0;border:0;border-radius:10px;background:#0a0e1499;box-shadow:inset 0 1px 0 #ffffff2a,0 0 0 1px #ffffff26;color:#d6e3f0;cursor:pointer;transition:background .15s,transform .15s}.gxPG:hover{background:#3a5f86cc;transform:translateY(-1px)}
.gxPL{display:grid;place-items:center;filter:drop-shadow(0 2px 8px #000a)}.gxPL svg,.gxPL img{max-height:44px;max-width:120px}
.gxPm{font:600 11px var(--gt);letter-spacing:.2em;text-transform:uppercase;color:#9fb6cc;margin-top:2px}
.gxP h3{margin:0;font:300 clamp(20px,3.2vh,32px)/1.1 var(--gt);letter-spacing:.02em;text-shadow:0 2px 14px #000}
.gxPT{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.gxPT i,.gxPT em{font:600 10.5px var(--gt);font-style:normal;letter-spacing:.12em;text-transform:uppercase;padding:5px 11px;border-radius:999px;background:#0a0e1488;box-shadow:inset 0 1px 0 #ffffff22,0 0 0 1px #ffffff1a;color:#d6e3f0}
.gxPT em{background:#e9eef3;color:#10151a;font-weight:700}
.gxPS{margin-top:auto;display:flex;gap:8px;justify-content:center;pointer-events:auto}
.gxPC{flex:0 1 124px;min-width:0;padding:5px 5px 6px;border-radius:12px;background:#0a0e1480;box-shadow:inset 0 1px 0 #ffffff1c,0 0 0 1px #ffffff18;cursor:pointer;opacity:.78;transition:opacity .15s,transform .15s}
.gxPC:hover{opacity:1;transform:translateY(-2px)}
.gxPC.on{opacity:1;cursor:default;background:#1a2733c0;box-shadow:inset 0 1px 0 #ffffff33,0 0 0 1.5px #8fb4d8}
.gxPC canvas{width:100%;height:auto;aspect-ratio:168/100;display:block;border-radius:8px;opacity:0;transition:opacity .25s;background:radial-gradient(ellipse at 50% 85%,#566271,#1a2027)}.gxPC canvas.rdy{opacity:1}
.gxPC span{display:block;margin-top:4px;font:600 9.5px var(--gt);letter-spacing:.08em;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:center;color:#cfdbe8}
#s8setup.carIdle #prepHint{bottom:clamp(6px,1.6vh,16px)}
#s8setup.carIdle #gxSu.g2 .gxTn{display:none!important}
#s8setup.carIdle #gxSu.g2 .gxCards .gxr:not(.gxAddT),#s8setup.carIdle #gxSu.g2 .gxCards h5{display:none!important}
#s8setup.carIdle #gxSu.g2 .gxCards{position:absolute;right:clamp(16px,2vw,34px);bottom:clamp(14px,3vh,34px);padding:0!important;z-index:3}
#s8setup.carZoom #prepZoomX{display:block;position:absolute;left:clamp(20px,3vw,44px);top:clamp(10px,2vh,24px);z-index:4;padding:6px 14px;border:0;border-radius:999px!important;background:#0a0e1488;box-shadow:inset 0 1px 0 #ffffff26,0 0 0 1px #ffffff22;color:#cfe0f0;font:600 11px var(--gt);letter-spacing:.16em;text-transform:uppercase;cursor:pointer}
#s8setup.carZoom #gxSu.g2 .gxTn{left:clamp(20px,3vw,44px)!important;top:clamp(44px,8vh,84px)!important;bottom:auto!important;width:min(34vw,400px);max-width:none!important;padding:14px 18px 16px;border-radius:16px!important;background:#0a0e1499;box-shadow:inset 0 1px 0 #ffffff26,0 0 0 1px #ffffff1c,0 12px 30px #0008}
#s8setup.carZoom #gxSu.g2 .gxTn b{font-size:clamp(22px,3.6vh,40px)!important;margin:2px 0 8px}
#s8setup.carZoom #gxSu.g2 .gxCards{position:absolute;left:clamp(20px,3vw,44px);bottom:clamp(72px,11vh,110px);width:min(34vw,400px);flex-direction:column!important;flex-wrap:nowrap!important;align-items:stretch!important;gap:6px!important;padding:12px!important;border-radius:16px!important;background:#0a0e1499;box-shadow:inset 0 1px 0 #ffffff26,0 0 0 1px #ffffff1c,0 12px 30px #0008;z-index:3}
#s8setup.carZoom #gxSu.g2 .gxCards .gxr{flex-direction:row!important;justify-content:space-between;align-items:center!important;background:#ffffff0d!important;box-shadow:none!important;backdrop-filter:none!important;padding:7px 14px!important}
#s8setup.carZoom #gxSu.g2 .gxCards .gxr.on{background:linear-gradient(180deg,#8fb4d8e0 0%,#4f7eabe8 48%,#33608ce8 52%,#4a77a3e8 100%)!important}
#s8setup.carZoom #gxSu.g2 .gxTn,#s8setup.carZoom #gxSu.g2 .gxCards{box-sizing:border-box!important;left:clamp(20px,3vw,44px)!important;right:auto!important;margin:0!important;width:min(34vw,400px)!important;transform:none!important}
#s8setup.carZoom #gxSu.g2 .gxCards .gxr{box-sizing:border-box!important;width:100%!important;margin:0!important;min-width:0!important}
#s8setup.carZoom #gxSu.g2,#s8setup.carZoom #gxSu.g2 .gxHero,#s8setup.carZoom #gxSu.g2 .gxHero *{overflow:visible!important;clip-path:none!important}
#s8setup.carZoom #gxSu.g2 .gxCards h5,#s8setup.carZoom #gxSu.g2 .gxCards .gxCard.empty{display:none!important}
#s8setup.prepLive.pillOn #gxSu.g2 .gxst{display:grid;grid-template-columns:auto minmax(110px,190px) auto;gap:7px 12px;align-items:center;margin-top:12px;font:500 clamp(10px,1.3vh,13px) var(--gt);letter-spacing:.14em;text-transform:uppercase;color:#aebfd0;text-shadow:0 1px 6px #000}
#s8setup.prepLive.pillOn #gxSu.g2 .gxst u{display:block;height:4px;border-radius:2px!important;background:#ffffff26;overflow:hidden}
#s8setup.prepLive.pillOn #gxSu.g2 .gxst u i{display:block;height:100%;background:linear-gradient(90deg,#8fb4d8,#dff0ff);box-shadow:0 0 8px #8fb4d8}
#s8setup.prepLive.pillOn #gxSu.g2 .gxst em{font-style:normal;color:#fff;letter-spacing:.04em;text-transform:none;font-variant-numeric:tabular-nums}
#s8setup.prepLive.pillOn #gxSu.g2 .gxTn b{font-size:clamp(30px,4.8vh,58px)}
#s8setup.prepLive.pillOn #gxSu.g2 .gxCards:not(.g4) .gxr.more{border-top:0;margin-top:0!important}

#s8setup.prepLive #gxSu.g2 .gxHero{background:transparent!important;box-shadow:none!important;cursor:grab}
#s8setup.prepLive #gxSu.g2 .gxHero:active{cursor:grabbing}
#s8setup.prepLive #gxSu.g2 #gxShot,#s8setup.prepLive #gxHi{visibility:hidden}
#s8setup.prepLive #gxSu.g2 .gxHero:after{display:none}
#s8setup.prepLive #gxSu.g2 .gxTn b{text-shadow:0 2px 24px #000a}
#s8setup.prepLive #gxSu.g2 .gxCard{background:linear-gradient(180deg,#1d2228a6,#0d1014bf)!important;backdrop-filter:blur(18px) saturate(1.2);-webkit-backdrop-filter:blur(18px) saturate(1.2);box-shadow:inset 0 1px 0 #ffffff2e,0 0 0 1px #0008,0 18px 40px #0008!important}
#s8setup.prepLive #gxSu.g2 .gxCard.pf.empty,#s8setup.prepLive #gxSu.g2 .gxCard.pf.idle{background:#0a0d1066!important;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
#s8setup.prepLive #gxSu.g2 .gxMapBox,#s8setup.prepLive #gxSu.g2 .gxSide{background:linear-gradient(180deg,#1d2228b3,#0d1014c8)!important;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
#prepTag{position:absolute;right:clamp(16px,2vw,32px);bottom:calc(100% - 64px);z-index:3;display:none}
#prepWait{position:absolute;left:50%;top:38%;z-index:1;transform:translate(-50%,-50%);font:600 10px var(--gt);letter-spacing:.3em;color:#8fb4d8;opacity:0;transition:opacity .3s;pointer-events:none}
#s8setup.prepBuild #prepWait{opacity:.8}
@media (prefers-reduced-motion:reduce){#prepCv{transition:none}}`;document.head.appendChild(st);
let R2=null,cv=null,vig=null,wait=null,S=null,gone=0,raf=0,lastT=0,pend=null;
const cam=new THREE.PerspectiveCamera(46,16/9,.3,6000),key=new THREE.DirectionalLight(0xffffff,.35);
const U=()=>window.TODU;
/* ---- the world ---- */
function free(){if(!S)return;const s=S;S=null;try{for(const c of s.cars)s.sc.remove(c);s.sc.remove(key);s.sc.remove(key.target);disposeWorld(s.sc);if(R2)R2.renderLists.dispose()}catch(e){console.warn('prep free',e)}const sec=$('s8setup');if(sec)sec.classList.remove('prepLive')}
P.prepFree=free;let lastErr='';P.prepDbg=()=>({S:!!S,track:S&&S.track,cars:S&&S.cars.length,cv:!!cv,cvOn:!!(cv&&cv.isConnected),cls:($('s8setup')||{}).className,w:JSON.stringify(want()&&{t:want().track,s:want().step}),err:lastErr,building,cam:cam.position.toArray().map(Math.round)});
function build(track,tod){free();const d=D[track];if(!d)return null;
 const T=sampleTrack(Object.assign({},d)),sc=buildWorld(T);
 /* time of day: P.applyTod writes the shared grade uniforms and the main exposure; take what it wants for this view and put the game's back */
 const u=U(),sv=u?{mul:u.mul.value.clone(),add:u.add.value.clone(),sat:u.sat.value}:null,ct=P.curTod,ex=R.toneMappingExposure,be=P.baseExpo;let look=null;
 try{if(P.applyTod)P.applyTod(sc,T,tod);look=u?{mul:u.mul.value.clone(),add:u.add.value.clone(),sat:u.sat.value}:null}catch(e){console.warn('prep tod',e)}
 const expo=R.toneMappingExposure;if(u&&sv){u.mul.value.copy(sv.mul);u.add.value.copy(sv.add);u.sat.value=sv.sat}P.curTod=ct;R.toneMappingExposure=ex;P.baseExpo=be;
 try{if(P.skyxUpgrade)P.skyxUpgrade(sc,d)}catch(e){}
 let dome=null,sun=null;sc.traverse(o=>{if(!dome&&o.isMesh&&o.geometry&&o.geometry.type==='SphereGeometry'&&o.geometry.parameters&&o.geometry.parameters.radius===1500)dome=o;if(!sun&&o.isDirectionalLight)sun=o});
 const sd=new THREE.Vector3(.4,.6,-.7);if(sun){sd.copy(sun.position);if(sun.target)sd.sub(sun.target.position);if(sd.lengthSq()<1e-6)sd.set(.4,.6,-.7);sd.normalize();if(sd.y<.12)sd.y=.12;sd.normalize();
  sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.bias=-.0004;sun.shadow.normalBias=.02;if(!sun.target.parent)sc.add(sun.target)}
 sc.add(key);sc.add(key.target);
 /* the layout's box (for the aerial) */
 let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9,y1=-1e9;for(let i=0;i<T.N;i++){x0=Math.min(x0,T.x[i]);x1=Math.max(x1,T.x[i]);z0=Math.min(z0,T.z[i]);z1=Math.max(z1,T.z[i]);y1=Math.max(y1,T.y[i])}
 const open=!!(d.rally||(d.cartoon&&d.cartoon.stage)||T.open||T.stage);
 const fog=sc.fog?{near:sc.fog.near,far:sc.fog.far}:null;
 return{track,tod,T,sc,sun,sd,dome,grade:look,expo,look:null,cars:[],carKey:'',open,fog,box:{cx:(x0+x1)/2,cz:(z0+z1)/2,e:Math.max(x1-x0,z1-z0),y:y1},t0:performance.now(),shot:null,sh:0,ang:0}}
/* a point on the road at a fractional sample (wraps on a loop, clamps on a stage) */
function at(T,f,open){const N=T.N;if(open)f=Math.max(0,Math.min(N-1.001,f));const i=Math.floor(f),u=f-i,a=((i%N)+N)%N,b=(((i+1)%N)+N)%N;
 return{x:T.x[a]+(T.x[b]-T.x[a])*u,y:T.y[a]+(T.y[b]-T.y[a])*u,z:T.z[a]+(T.z[b]-T.z[a])*u,psi:T.psi[a],hw:T.hw[a]}}
/* ---- the cars on the grid ---- */
function carsFor(s,list){const k=list.map(c=>c.id+'.'+c.alt).join('|');if(s.carKey===k)return;for(const c of s.cars)s.sc.remove(c);s.cars=[];s.carKey=k;
 const T=s.T,N=T.N;list.forEach((c,p)=>{const car=P.BYID[c.id],src=car&&P.C10&&P.C10.model(car.k10,c.alt);if(!src)return;const m=src.clone(true);
  const i=s.open?Math.min(N-1,6):((N-5)%N+N)%N,lat=-(p-(list.length-1)/2)*5.6,ps=T.psi[i],cs=Math.cos(ps),sn=Math.sin(ps);
  m.rotation.set(0,ps,0);m.position.set(0,0,0);m.updateMatrixWorld(true);const bx=new THREE.Box3().setFromObject(m);
  m.position.set(T.x[i]+sn*lat,T.y[i]-bx.min.y+.01,T.z[i]+cs*lat);m.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});s.sc.add(m);s.cars.push(m)})}
/* ---- the camera ---- */
const SHOTS=['fly','pan','low','high'];
function nextShot(s){const T=s.T,N=T.N,sp=T.sp||2;s.sh++;if(s.sh===0&&s.open)s.sh=1;const kind=s.sh===1&&!s.open?'aerial':SHOTS[(s.sh-2+SHOTS.length)%SHOTS.length];
 const k0=s.open?Math.random()*(N*.8)+N*.05:Math.random()*N;s.shot={kind,k0,side:Math.random()<.5?-1:1,t0:performance.now(),dur:kind==='aerial'?9:kind==='pan'?6.5:7.5,sp}}
function camRace(s,now){const T=s.T;if(!s.shot)nextShot(s);let sh=s.shot,t=(now-sh.t0)/1000;
 if(t>sh.dur&&!pend){pend=1;cv.classList.add('cut');setTimeout(()=>{if(S===s){nextShot(s)}pend=null;setTimeout(()=>cv&&cv.classList.remove('cut'),40)},230)}
 const sp=sh.sp,P_=new THREE.Vector3(),L=new THREE.Vector3();
 if(sh.kind==='aerial'){const b=s.box,a=t*.05+sh.side,r=b.e*.62+120,h=b.e*.42+90;P_.set(b.cx+Math.sin(a)*r,b.y+h,b.cz+Math.cos(a)*r);L.set(b.cx,b.y-b.e*.04,b.cz)}
 else{const v=sh.kind==='fly'?22:sh.kind==='low'?30:sh.kind==='high'?16:34,f=sh.k0+v*t/sp,q=at(T,f,s.open),c=Math.cos(q.psi),sn=Math.sin(q.psi),side=sh.side;
  if(sh.kind==='fly'){const a=at(T,f+55/sp,s.open);P_.set(q.x+c*side*(q.hw+7),q.y+11,q.z-sn*side*(q.hw+7));L.set(a.x,a.y+1,a.z)}
  else if(sh.kind==='low'){const b=at(T,f-10/sp,s.open),a=at(T,f+34/sp,s.open),cb=Math.cos(b.psi),sb=Math.sin(b.psi);P_.set(b.x+cb*side*b.hw*.45,b.y+2.4,b.z-sb*side*b.hw*.45);L.set(a.x,a.y+1.2,a.z)}
  else if(sh.kind==='high'){const a=at(T,f+18/sp,s.open);P_.set(q.x+c*side*42,q.y+48,q.z-sn*side*42);L.set(a.x,a.y,a.z)}
  else{/* pan: a fixed camera by the road that follows a point running past it */const o=at(T,sh.k0,s.open),co=Math.cos(o.psi),so=Math.sin(o.psi),a=at(T,sh.k0+(-60+v*t)/sp,s.open);P_.set(o.x+co*side*(o.hw+13),o.y+3.2,o.z-so*side*(o.hw+13));L.set(a.x,a.y+1,a.z)}}
 const g=GBf(T,P_.x,P_.z);if(isFinite(g)&&P_.y<g+2)P_.y=g+2;
 cam.position.copy(P_);cam.lookAt(L);s.look=L;return sh.kind==='aerial'?b2(s):null}
const b2=s=>s.box.e*2.4+700;
let drag=0,dragX=null;
/* the hint, the close button and the label of the car button, kept in the setup box */
function carChrome(sec,s){const box=document.getElementById('gxSu');if(!box)return;let h=document.getElementById('prepHint');if(!h){h=document.createElement('div');h.id='prepHint';h.textContent='Click a car to customise it';box.appendChild(h)}
 let x=document.getElementById('prepZoomX');if(!x){x=document.createElement('button');x.id='prepZoomX';x.type='button';x.textContent='\u2039 All cars';x.onclick=e=>{e.stopPropagation();if(S)S.zoom=-1};box.appendChild(x)}
 box.querySelectorAll('.gxr .l').forEach(l=>{if(l.textContent==='Car')l.textContent='Change car'})}
document.addEventListener('click',e=>{const s=S;if(!s||!s.cars||!s.cars.length||!document.getElementById('s8setup').classList.contains('prepLive'))return;if(!e.target.closest||e.target.closest('button,input,.gxr,.gxCard,.gxTn,.gxMapBox,.foot8,#suSteps'))return;if(!e.target.closest('#gxSu'))return;
 const rc=cv.getBoundingClientRect(),ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2(((e.clientX-rc.left)/rc.width)*2-1,-(((e.clientY-rc.top)/rc.height)*2-1)),cam);
 let hit=-1,best=1e9;s.cars.forEach((c,i)=>{const h=ray.intersectObject(c,true)[0];if(h&&h.distance<best){best=h.distance;hit=i}});
 if(hit>=0){if(s.zoom!==hit){s.zoom=hit;const card=document.querySelectorAll('#gxSu .gxCard.pf')[hit],row=card&&card.querySelector('.gxr');if(row)row.dispatchEvent(new MouseEvent('mouseenter'))}}else if(s.zoom>=0)s.zoom=-1},true);
function camCar(s,dt){const n=s.cars.length;if(!n)return;const C=new THREE.Vector3();for(const c of s.cars)C.add(c.position);C.divideScalar(n);
 /* Nov 10 (Hakan: the cars playing, centred; click one and the camera zooms to it, the frame on the left): zk eases 0 to 1 while a car is picked */
 const zi=Math.min(n-1,Math.max(0,s.zoom|0)),zt=FAST()&&s.zoom>=0?1:0;s.zk=(s.zk||0)+(zt-(s.zk||0))*Math.min(1,dt*5);const zk=s.zk;
 if(dragX==null)s.ang+=dt*(zk>.5?.07:.13);s.ang+=drag;drag=0;const ps=s.cars[0].rotation.y,r0=(FAST()?9.6:7.4)+2.6*(n-1)+(n>2?1.6:0),r=r0+(5.4-r0)*zk,h=(1.35+.45*(n-1))*(1-.3*zk),a=ps+.95+s.ang;
 if(zk>.001)C.lerp(s.cars[zi].position,zk);
 cam.position.set(C.x+Math.sin(a)*r,C.y+h,C.z+Math.cos(a)*r);const g=GBf(s.T,cam.position.x,cam.position.z);if(isFinite(g)&&cam.position.y<g+.7)cam.position.y=g+.7;
 const L=C.clone();L.y+=.45;cam.lookAt(L);s.look=L}
/* Nov 10 (Hakan: "there should be no track as a background"): on the car step the track is hidden and the cars stand in a dark studio: a soft round
   floor that fades out, a deep gradient backdrop, the sun kept as the key light (PTO.prepStudio===false: the cars on the track as before) */
let BGTEX=null,FLTEX=null;
function studioTex(){if(BGTEX)return;const c=document.createElement('canvas');c.width=256;c.height=256;const g=c.getContext('2d'),gr=g.createRadialGradient(150,120,10,128,140,200);gr.addColorStop(0,'#3a4656');gr.addColorStop(.5,'#161c25');gr.addColorStop(1,'#05070a');g.fillStyle=gr;g.fillRect(0,0,256,256);BGTEX=new THREE.CanvasTexture(c);BGTEX.encoding=THREE.sRGBEncoding;
 const f=document.createElement('canvas');f.width=f.height=256;const h=f.getContext('2d'),fg=h.createRadialGradient(128,128,0,128,128,128);fg.addColorStop(0,'#fff');fg.addColorStop(.55,'#9a9a9a');fg.addColorStop(1,'#000');h.fillStyle=fg;h.fillRect(0,0,256,256);FLTEX=new THREE.CanvasTexture(f)}
function studio(s,on){if(!!s.stOn===on)return;s.stOn=on;
 if(on){studioTex();if(!s.stGrp){const m=new THREE.MeshStandardMaterial({color:0x2a313b,roughness:.42,metalness:.15,alphaMap:FLTEX,transparent:true});const fl=new THREE.Mesh(new THREE.CircleGeometry(34,48),m);fl.rotation.x=-Math.PI/2;fl.receiveShadow=true;s.stGrp=fl;s.sc.add(fl)}
  s.stGrp.visible=true;s.stHide=[];for(const o of s.sc.children){if(o===s.stGrp||o.isLight||o===key||o===key.target||(s.sun&&o===s.sun.target)||s.cars.includes(o))continue;if(o.visible){o.visible=false;s.stHide.push(o)}}
  s.stBg=s.sc.background;s.stFog=s.sc.fog;s.sc.background=BGTEX;s.sc.fog=null}
 else{if(s.stGrp)s.stGrp.visible=false;for(const o of s.stHide||[])o.visible=true;s.stHide=null;s.sc.background=s.stBg||null;s.sc.fog=s.stFog||null}}
/* ---- what the setup screen shows right now ---- */
function want(){const sec=$('s8setup');if(!on()||!sec||!sec.classList.contains('on')||!sec.classList.contains('gxOn'))return null;const u=P.ui;if(!u||!u.ST||u.ST.custom)return null;const ST=u.ST;
 if(!$('gxSu')||$('gxSu').style.display==='none')return null;const chips=document.querySelectorAll('#suSteps i'),step=chips.length>1&&chips[1].classList.contains('on')?2:1;
 const tod=ST.todUser||(D[ST.track]&&D[ST.track].tod0)||'day',np=ST.mode==='ta'?1:Math.max(1,Math.min(4,ST.players||1)),cars=[];
 if(step===2&&u.selCar)for(let p=0;p<np;p++){try{const c=u.selCar(p);if(c)cars.push({id:c.id,alt:c.alt|0})}catch(e){}}
 return{sec,track:ST.track,tod,step,cars}}
function size(sec){/* Nov 10 (Hakan: "2 fps on the track previews"): drawn at about 0.7 of the screen's pixels (it sits behind frosted glass and a vignette) instead of 1.25x (PTO.prepFast===false: as before) */
 const dpr=FAST()?(S&&S.stOn?Math.min(2,devicePixelRatio||1):Math.min(.7,devicePixelRatio||1)):Math.min(1.25,devicePixelRatio||1),w=sec.clientWidth|0,h=sec.clientHeight|0;if(!w||!h)return false;
 if(R2.getPixelRatio()!==dpr)R2.setPixelRatio(dpr);const v=R2.getSize(new THREE.Vector2());if(v.x!==w||v.y!==h)R2.setSize(w,h,false);cam.aspect=w/h;return true}
function ensure(sec){if(!cv||!cv.isConnected){cv=document.createElement('canvas');cv.id='prepCv';vig=document.createElement('div');vig.id='prepVig';wait=document.createElement('div');wait.id='prepWait';wait.textContent='LOADING TRACK';sec.insertBefore(wait,sec.firstChild);sec.insertBefore(vig,sec.firstChild);sec.insertBefore(cv,sec.firstChild);
  if(R2){try{R2.dispose()}catch(e){}}R2=new THREE.WebGLRenderer({canvas:cv,antialias:true,powerPreference:'high-performance'});R2.outputEncoding=THREE.sRGBEncoding;R2.toneMapping=THREE.ACESFilmicToneMapping;R2.physicallyCorrectLights=R.physicallyCorrectLights;R2.shadowMap.enabled=true;R2.shadowMap.type=FAST()?THREE.PCFShadowMap:THREE.PCFSoftShadowMap;if(FAST())R2.shadowMap.autoUpdate=false}}
let building=0;
function frame(now){raf=requestAnimationFrame(frame);const w=want();
 if(!w){if(S&&!gone)gone=now;if(S&&now-gone>1500)free();const sec=$('s8setup');if(sec)sec.classList.remove('prepLive','prepBuild');return}gone=0;
 if(document.hidden)return;ensure(w.sec);
 if(!S||S.track!==w.track||S.tod!==w.tod){if(building)return;building=1;w.sec.classList.add('prepBuild');w.sec.classList.remove('prepLive');
  /* let the fade show, then build (a second or so on the big maps) */
  setTimeout(()=>{try{const s=build(w.track,w.tod);S=s}catch(e){console.warn('prep build',e);lastErr=String(e&&e.stack||e).slice(0,300);S=null;if(window.PTO)window.PTO.prepLive=false}building=0;w.sec.classList.remove('prepBuild')},60);return}
 if(FAST()&&!(S&&S.stOn)&&now-lastDraw<30)return;/* 30 frames a second at most on the track view; the car studio runs flat out */
 lastDraw=now;fcount++;
 const s=S,dt=Math.min(.05,(now-(lastT||now))/1000);lastT=now;if(!size(w.sec))return;
 if(w.step===2){carsFor(s,w.cars);for(const c of s.cars)c.visible=true}else for(const c of s.cars)c.visible=false;
 if(w.step!==2||!s.cars.length)s.zoom=-1;w.sec.classList.toggle('carIdle',w.step===2&&FAST()&&s.zoom<0);w.sec.classList.toggle('carZoom',w.step===2&&FAST()&&s.zoom>=0);if(s.zoom>=0){const tn=w.sec.querySelector('#gxSu .gxTn'),cd=w.sec.querySelector('#gxSu .gxCards');if(tn&&cd){tn.style.setProperty('margin-left','0px','important');const d=cd.getBoundingClientRect().left-tn.getBoundingClientRect().left;if(Math.abs(d)>1)tn.style.setProperty('margin-left',d+'px','important')}}
 carChrome(w.sec,s);
 if(FAST()&&!(window.PTO&&window.PTO.prepStudio===false)){studio(s,w.step===2&&s.cars.length>0);if(s.stOn&&s.stGrp&&s.cars.length){const c0=s.cars[0];s.stGrp.position.set(c0.position.x,c0.position.y-.02,c0.position.z)}}
 if(s.step!==w.step){s.step=w.step;s.shot=null;s.sh=0;s.ang=0;cv.classList.remove('cut');pend=null}
 let far=null;if(w.step===2&&s.cars.length)camCar(s,dt);else far=camRace(s,now);
 /* the subject sits in the open part of the picture (above the cards, right of the name) */
 const W=1000,H=Math.round(1000/cam.aspect),cars=w.step===2;cam.setViewOffset(W,H,cars?(FAST()?-W*.2*(s.zk||0):-W*.12):-W*.04,H*(cars?(FAST()?(-.07*(1-(s.zk||0))+.03*(s.zk||0)):.13):.1),W,H);cam.updateProjectionMatrix();
 if(s.fog&&s.sc.fog){const f=far||s.fog.far;s.sc.fog.far=f;s.sc.fog.near=far?Math.min(far*.4,s.fog.near+far*.2):s.fog.near}
 if(s.dome)s.dome.position.copy(cam.position);const m=s.sc.userData.skyx;if(m&&m.uniforms)m.uniforms.t.value=(now-s.t0)/1000+40;
 if(s.sun&&s.look){const L=s.look,ext=cars?16:far?Math.min(600,s.box.e*.7):90;s.sun.target.position.copy(L);s.sun.position.copy(L).addScaledVector(s.sd,Math.max(200,ext*1.5));s.sun.target.updateMatrixWorld();const sc_=s.sun.shadow.camera;
  if(sc_.right!==ext){sc_.left=-ext;sc_.right=ext;sc_.top=ext;sc_.bottom=-ext;sc_.near=1;sc_.far=ext*4+400;sc_.updateProjectionMatrix()}}
 /* a soft key light from the camera side so the car always reads, whatever the time of day */
 key.intensity=cars?(s.tod==='night'?.55:.3):0;key.position.copy(cam.position).add(new THREE.Vector3(0,3,0));if(s.look)key.target.position.copy(s.look);key.target.updateMatrixWorld();
 const u=U(),sv=u&&s.grade?{mul:u.mul.value.clone(),add:u.add.value.clone(),sat:u.sat.value}:null;
 if(sv){u.mul.value.copy(s.grade.mul);u.add.value.copy(s.grade.add);u.sat.value=s.grade.sat}
 R2.toneMappingExposure=s.expo||1.05;if(FAST()){R2.shadowMap.needsUpdate=s.stOn||(fcount%4===0)||!s.shadowed;s.shadowed=1;if(s.sun&&s.sun.shadow&&s.sun.shadow.mapSize.x!==(s.stOn?2048:1024)){s.sun.shadow.mapSize.set(s.stOn?2048:1024,s.stOn?2048:1024);if(s.sun.shadow.map){s.sun.shadow.map.dispose();s.sun.shadow.map=null}}}
 if(w.step===2&&FAST()&&s.cars.length&&!(s.zk>.02)){try{const W2=R2.domElement.clientWidth||innerWidth,ps=[...w.sec.querySelectorAll('#gxSu .gxP')];cam.updateMatrixWorld();const xs=ps.map(el=>{const c=s.cars[+el.dataset.p];if(!c)return null;const v=c.position.clone();v.y+=1;v.project(cam);return (v.x*.5+.5)*W2});let gap=1e9;const xv=xs.filter(x=>x!=null).sort((a,b)=>a-b);for(let i=1;i<xv.length;i++)gap=Math.min(gap,xv[i]-xv[i-1]);const pw=Math.max(190,Math.min(400,gap-14,W2*.9));ps.forEach((el,i)=>{if(xs[i]==null)return;el.style.width=pw+'px';el.style.left=Math.max(8,Math.min(W2-pw-8,xs[i]-pw/2))+'px'})}catch(e){}}
 try{R2.render(s.sc,cam)}catch(e){console.warn('prep render',e);lastErr='R '+String(e&&e.stack||e).slice(0,300);if(window.PTO)window.PTO.prepLive=false;free()}
 if(sv){u.mul.value.copy(sv.mul);u.add.value.copy(sv.add);u.sat.value=sv.sat}
 w.sec.classList.add('prepLive');w.sec.classList.toggle('pillOn',!(window.PTO&&window.PTO.prepPills===false))}
raf=requestAnimationFrame(frame);
/* drag on the picture turns the car */
document.addEventListener('pointerdown',e=>{if(!S||!e.target.closest||!e.target.closest('#s8setup.prepLive .gxHero')||e.target.closest('.gxMapBox,.gxSide,button,input'))return;dragX=e.clientX;
 const mv=ev=>{if(dragX==null)return;drag+=(ev.clientX-dragX)*-.006;dragX=ev.clientX},up=()=>{dragX=null;removeEventListener('pointermove',mv);removeEventListener('pointerup',up)};addEventListener('pointermove',mv);addEventListener('pointerup',up)});
/* a race frees the preview world before it builds its own */
{const l0=P.launch;if(l0)P.launch=function(){try{free()}catch(e){}return l0.apply(this,arguments)}}
})();
