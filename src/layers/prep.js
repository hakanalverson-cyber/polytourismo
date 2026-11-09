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
const $=id=>document.getElementById(id);
const GBf=(T,x,z)=>{try{return window.GB?window.GB(T,x,z):(T.terr?T.terr(x,z):0)}catch(e){return 0}};
const st=document.createElement('style');st.textContent=`
#prepCv{position:absolute;inset:0;width:100%;height:100%;z-index:0;opacity:0;transition:opacity .5s ease;pointer-events:none;display:block}
#s8setup.prepLive #prepCv{opacity:1}
#s8setup.prepLive #prepCv.cut{opacity:0;transition:opacity .22s ease}
#prepVig{position:absolute;inset:0;z-index:1;pointer-events:none;opacity:0;transition:opacity .5s;background:radial-gradient(ellipse 90% 80% at 60% 35%,#0000 40%,#0006 100%),linear-gradient(0deg,#000c 0%,#0007 30%,#0000 55%)}
#s8setup.prepLive #prepVig{opacity:1}
#s8setup.prepLive::before{opacity:0!important}
#s8setup.prepLive #gxSu.g2 .gxHero{background:transparent!important;box-shadow:none!important;cursor:grab}
#s8setup.prepLive #gxSu.g2 .gxHero:active{cursor:grabbing}
#s8setup.prepLive #gxSu.g2 #gxShot,#s8setup.prepLive #gxHi{visibility:hidden}
#s8setup.prepLive #gxSu.g2 .gxHero:after{background:linear-gradient(90deg,#0009 0%,#0004 30%,#0000 55%)!important}
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
P.prepFree=free;
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
  const row=p>>1,i=s.open?Math.min(N-1,6+row*5):((N-5-row*6)%N+N)%N,lat=list.length>1?(p&1?1:-1)*Math.min(2.3,T.hw[i]*.38):0,ps=T.psi[i],cs=Math.cos(ps),sn=Math.sin(ps);
  m.rotation.set(0,ps,0);m.position.set(0,0,0);m.updateMatrixWorld(true);const bx=new THREE.Box3().setFromObject(m);
  m.position.set(T.x[i]+cs*lat,T.y[i]-lat*T.bank[i]-bx.min.y+.01,T.z[i]-sn*lat);m.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});s.sc.add(m);s.cars.push(m)})}
/* ---- the camera ---- */
const SHOTS=['fly','pan','low','high'];
function nextShot(s){const T=s.T,N=T.N,sp=T.sp||2;s.sh++;const kind=s.sh===1?'aerial':SHOTS[(s.sh-2)%SHOTS.length];
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
const b2=s=>s.box.e*1.6+400;
let drag=0,dragX=null;
function camCar(s,dt){const n=s.cars.length;if(!n)return;const C=new THREE.Vector3();for(const c of s.cars)C.add(c.position);C.divideScalar(n);
 if(dragX==null)s.ang+=dt*.13;s.ang+=drag;drag=0;const ps=s.cars[0].rotation.y,r=5.6+2.3*(n-1)+(n>2?1.6:0),h=1.25+.45*(n-1),a=ps+.95+s.ang;
 cam.position.set(C.x+Math.sin(a)*r,C.y+h,C.z+Math.cos(a)*r);const g=GBf(s.T,cam.position.x,cam.position.z);if(isFinite(g)&&cam.position.y<g+.7)cam.position.y=g+.7;
 const L=C.clone();L.y+=.45;cam.lookAt(L);s.look=L}
/* ---- what the setup screen shows right now ---- */
function want(){const sec=$('s8setup');if(!on()||!sec||!sec.classList.contains('on')||!sec.classList.contains('gxOn'))return null;const u=P.ui;if(!u||!u.ST||u.ST.custom)return null;const ST=u.ST;
 if(!$('gxSu')||$('gxSu').style.display==='none')return null;const chips=document.querySelectorAll('#suSteps i'),step=chips.length>1&&chips[1].classList.contains('on')?2:1;
 const tod=ST.todUser||(D[ST.track]&&D[ST.track].tod0)||'day',np=ST.mode==='ta'?1:Math.max(1,Math.min(4,ST.players||1)),cars=[];
 if(step===2&&u.selCar)for(let p=0;p<np;p++){try{const c=u.selCar(p);if(c)cars.push({id:c.id,alt:c.alt|0})}catch(e){}}
 return{sec,track:ST.track,tod,step,cars}}
function size(sec){const dpr=Math.min(1.5,devicePixelRatio||1),w=sec.clientWidth|0,h=sec.clientHeight|0;if(!w||!h)return false;
 if(R2.getPixelRatio()!==dpr)R2.setPixelRatio(dpr);const v=R2.getSize(new THREE.Vector2());if(v.x!==w||v.y!==h)R2.setSize(w,h,false);cam.aspect=w/h;return true}
function ensure(sec){if(!cv||!cv.isConnected){cv=document.createElement('canvas');cv.id='prepCv';vig=document.createElement('div');vig.id='prepVig';wait=document.createElement('div');wait.id='prepWait';wait.textContent='LOADING TRACK';sec.insertBefore(wait,sec.firstChild);sec.insertBefore(vig,sec.firstChild);sec.insertBefore(cv,sec.firstChild);
  if(R2){try{R2.dispose()}catch(e){}}R2=new THREE.WebGLRenderer({canvas:cv,antialias:true,powerPreference:'high-performance'});R2.outputEncoding=THREE.sRGBEncoding;R2.toneMapping=THREE.ACESFilmicToneMapping;R2.physicallyCorrectLights=R.physicallyCorrectLights;R2.shadowMap.enabled=true;R2.shadowMap.type=THREE.PCFSoftShadowMap}}
let building=0;
function frame(now){raf=requestAnimationFrame(frame);const w=want();
 if(!w){if(S&&!gone)gone=now;if(S&&now-gone>1500)free();const sec=$('s8setup');if(sec)sec.classList.remove('prepLive','prepBuild');return}gone=0;
 if(document.hidden)return;ensure(w.sec);
 if(!S||S.track!==w.track||S.tod!==w.tod){if(building)return;building=1;w.sec.classList.add('prepBuild');w.sec.classList.remove('prepLive');
  /* let the fade show, then build (a second or so on the big maps) */
  setTimeout(()=>{try{const s=build(w.track,w.tod);S=s}catch(e){console.warn('prep build',e);S=null;if(window.PTO)window.PTO.prepLive=false}building=0;w.sec.classList.remove('prepBuild')},60);return}
 const s=S,dt=Math.min(.05,(now-(lastT||now))/1000);lastT=now;if(!size(w.sec))return;
 if(w.step===2){carsFor(s,w.cars);for(const c of s.cars)c.visible=true}else for(const c of s.cars)c.visible=false;
 if(s.step!==w.step){s.step=w.step;s.shot=null;s.sh=0;s.ang=0;cv.classList.remove('cut');pend=null}
 let far=null;if(w.step===2&&s.cars.length)camCar(s,dt);else far=camRace(s,now);
 /* the subject sits in the open part of the picture (above the cards, right of the name) */
 const W=1000,H=Math.round(1000/cam.aspect),cars=w.step===2;cam.setViewOffset(W,H,cars?-W*.12:-W*.04,H*(cars?.17:.1),W,H);cam.updateProjectionMatrix();
 if(s.fog&&s.sc.fog){const f=far||s.fog.far;s.sc.fog.far=f;s.sc.fog.near=far?Math.min(far*.4,s.fog.near+far*.2):s.fog.near}
 if(s.dome)s.dome.position.copy(cam.position);const m=s.sc.userData.skyx;if(m&&m.uniforms)m.uniforms.t.value=(now-s.t0)/1000+40;
 if(s.sun&&s.look){const L=s.look,ext=cars?16:far?Math.min(600,s.box.e*.7):90;s.sun.target.position.copy(L);s.sun.position.copy(L).addScaledVector(s.sd,Math.max(200,ext*1.5));s.sun.target.updateMatrixWorld();const sc_=s.sun.shadow.camera;
  if(sc_.right!==ext){sc_.left=-ext;sc_.right=ext;sc_.top=ext;sc_.bottom=-ext;sc_.near=1;sc_.far=ext*4+400;sc_.updateProjectionMatrix()}}
 /* a soft key light from the camera side so the car always reads, whatever the time of day */
 key.intensity=cars?(s.tod==='night'?.55:.3):0;key.position.copy(cam.position).add(new THREE.Vector3(0,3,0));if(s.look)key.target.position.copy(s.look);key.target.updateMatrixWorld();
 const u=U(),sv=u&&s.grade?{mul:u.mul.value.clone(),add:u.add.value.clone(),sat:u.sat.value}:null;
 if(sv){u.mul.value.copy(s.grade.mul);u.add.value.copy(s.grade.add);u.sat.value=s.grade.sat}
 R2.toneMappingExposure=s.expo||1.05;
 try{R2.render(s.sc,cam)}catch(e){console.warn('prep render',e);if(window.PTO)window.PTO.prepLive=false;free()}
 if(sv){u.mul.value.copy(sv.mul);u.add.value.copy(sv.add);u.sat.value=sv.sat}
 w.sec.classList.add('prepLive')}
raf=requestAnimationFrame(frame);
/* drag on the picture turns the car */
document.addEventListener('pointerdown',e=>{if(!S||!e.target.closest||!e.target.closest('#s8setup.prepLive .gxHero')||e.target.closest('.gxMapBox,.gxSide,button,input'))return;dragX=e.clientX;
 const mv=ev=>{if(dragX==null)return;drag+=(ev.clientX-dragX)*-.006;dragX=ev.clientX},up=()=>{dragX=null;removeEventListener('pointermove',mv);removeEventListener('pointerup',up)};addEventListener('pointermove',mv);addEventListener('pointerup',up)});
/* a race frees the preview world before it builds its own */
{const l0=P.launch;if(l0)P.launch=function(){try{free()}catch(e){}return l0.apply(this,arguments)}}
})();
