/* ===== layer: camera system (Nov 13, GT4-5 style).
   1. A finished car gets a calm drone orbit: constant radius and height, a slow drift in altitude, and the angle slides round any
      tree, pole or building that would stand between the drone and the car. It keeps circling until every driver has finished.
   2. Shift cycles the chase cameras in a race: Left Shift for player 1, Right Shift for player 2.
   3. Once you have finished, any key of your own control cluster (P1 Q W E A S D) opens the classification on your own part of the
      screen, and any key of the cluster closes it again. ===== */
(function camsys(){
'use strict';
const P=window.PT8;if(!P)return;
const V=THREE.Vector3,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),wr=a=>Math.atan2(Math.sin(a),Math.cos(a));
const css=document.createElement('style');css.textContent=`
.cbd{position:fixed;z-index:28;display:none;pointer-events:none;font-family:var(--gt,Inter,sans-serif);color:#fff}
.cbd.on{display:flex;align-items:center;justify-content:flex-start;padding-left:2.4%}
.cbd .bx{width:min(340px,92%);max-height:92%;overflow:hidden}
.cbd h4{margin:0 0 8px 2px;font:italic 800 10px var(--gt);letter-spacing:.32em;color:#cfd8de;text-shadow:0 1px 3px #000c}
.cbd h4 b{display:block;font:italic 800 18px var(--gt);letter-spacing:.06em;color:#fff;margin-top:2px}
.cbd .rw{display:flex;align-items:center;gap:10px;height:38px;margin-bottom:4px;padding:0 12px 0 0;border-radius:3px;position:relative;overflow:hidden;background:linear-gradient(90deg,#0a0d12ee,#10161dcc 70%,#10161d99);border:1px solid #ffffff22;border-left:3px solid #ffffff55;box-shadow:0 3px 12px #0008,inset 0 1px 0 #ffffff26}
.cbd .rw:before{content:"";position:absolute;inset:0 0 50% 0;background:linear-gradient(#ffffff1a,#ffffff00)}
.cbd .rw.me{border-left-color:var(--c,#9fd8ff);background:linear-gradient(90deg,#1c2a38f2,#223646d0 70%,#223646aa)}
.cbd .rk{width:36px;text-align:center;font:italic 800 18px var(--gt)}
.cbd .nm{flex:1;min-width:0;font:italic 800 12px var(--gt);letter-spacing:.05em;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cbd .nm small{display:block;font:600 9px var(--gt);letter-spacing:.14em;color:#aab6bf}
.cbd .tm{font:italic 700 12px var(--gt);color:#e9eef2}
/* Nov 13 (Hakan: the finish leaderboard in our own UI style): the glossy grey panel, title bar with the blue accent, grey rows, the player's own row in the blue gradient */
.cbd .bx{width:min(380px,94%);background:var(--gxp,linear-gradient(180deg,#1d2024eb,#101215f0));border:1px solid var(--gxl,#ffffff1c);border-top:2px solid #6fa0d0;border-radius:8px;box-shadow:0 16px 40px #000c,inset 0 1px 0 #ffffff30;padding:0 0 12px;overflow:hidden}
.cbd h4{margin:0 0 10px;padding:13px 18px 12px;background:var(--gx,linear-gradient(180deg,#3a3e44,#17191c));box-shadow:inset 0 -2px 0 #4f7eab88;font:300 12px var(--gt);font-style:normal;letter-spacing:.3em;color:#cfd8de;position:relative}
.cbd h4:before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:linear-gradient(180deg,#8fb4d8,#33608c)}
.cbd h4 b{font:300 22px var(--gt);font-style:normal;letter-spacing:.02em;color:#fff;margin-top:3px}
.cbd .rw{margin:0 12px 5px;height:36px;border-radius:5px;border:0;border-left:0;background:linear-gradient(180deg,#3a3e44f2 0%,#24272cf2 48%,#17191cf2 52%,#1e2125f2 100%);box-shadow:inset 0 1px 0 #ffffff30,0 0 0 1px #000c}
.cbd .rw:before{display:none}
.cbd .rw.me{background:linear-gradient(180deg,#8fb4d8e0 0%,#4f7eabe8 48%,#33608ce8 52%,#4a77a3e8 100%);box-shadow:inset 0 1px 0 #ffffffa0,0 0 14px #4f7eab66,0 0 0 1px #000c}
.cbd .rk{font:600 16px var(--gt);font-style:normal;width:34px;background:#0006;align-self:stretch;display:flex;align-items:center;justify-content:center;border-radius:5px 0 0 5px}
.cbd .nm{font:500 12px var(--gt);font-style:normal;letter-spacing:.08em}
.cbd .tm{font:500 12px var(--gt);font-style:normal;font-variant-numeric:tabular-nums}
.cbd .ft{text-align:center;color:#9aa3ab;margin-top:10px;font-weight:500;text-shadow:none}
.cbd .ft{margin-top:8px;font:700 9px var(--gt);letter-spacing:.24em;color:#cfd8de;text-shadow:0 1px 3px #000}
#cbT{position:fixed;left:50%;top:14%;transform:translateX(-50%);z-index:29;font:italic 800 12px var(--gt,Inter,sans-serif);letter-spacing:.3em;color:#fff;text-shadow:0 1px 4px #000;opacity:0;transition:opacity .25s;pointer-events:none}
`;document.head.appendChild(css);
const toastEl=document.createElement('div');toastEl.id='cbT';document.body.appendChild(toastEl);let tt=0;
const toast=t=>{toastEl.textContent=t;toastEl.style.opacity=1;clearTimeout(tt);tt=setTimeout(()=>toastEl.style.opacity=0,1100)};
const PC=['#9fd8ff','#ffb347','#8ef08a','#ff7a9a'];
const humans=()=>{const R_=typeof RACE!=='undefined'?RACE:null;return R_?R_.cars.filter(c=>c.human):[]};
/* ---------------- 1 + 2: the camera ---------------- */
const CAMN=['CHASE','FAR CHASE','LOW CHASE','BUMPER','ROOF'];
function install(){
 const prev=soloCam,_a=new V(),_b=new V();
 const inner=function(c,dt,out){
  const R_=typeof RACE!=='undefined'?RACE:null;
  if(!(c&&c.human&&R_&&R_.T)||(R_.cfg&&R_.cfg.rally)||R_.state==='count'&&!c.fin){prev.apply(this,arguments);if(R_.state==='count'&&c.human&&!(R_.cfg&&R_.cfg.rally)&&R_.T)intro(c,dt,out,R_);return}
  /* finished: the drone orbit (the old random cinematic is bypassed) */
  if(c.fin&&c.cool&&R_.state!=='done'||c.fin&&R_.state==='done'&&R_._orbOn){orbit(c,dt,out,R_);return}
  c._orb=null;
  /* under a bridge the view only drops to the bonnet when the bridge would really hide the car from this camera: never in the bonnet, bumper or
     low views, and in the chase views only if the deck sits on the line between the camera and the car (checked against the model, then held until clear) */
  if(c.inTn){const m0=c.camX|0;if(m0>=2){c.inTn=false;c.tnB=0;c._tnL=0}else{if(!c._tnL&&under(c,R_,m0))c._tnL=1;if(!c._tnL)c.inTn=false}}else c._tnL=0;
  prev.apply(this,arguments);
  /* Nov 13 (Hakan): hold Left Ctrl (player 1) or Right Ctrl (player 2) to look back; off with more than two players */
  if(c._lb&&!c.fin&&humans().length<=2){const K=P.carK?P.carK():1,yw=c.cy!=null?c.cy:c.yaw,fs=Math.sin(yw),fc=Math.cos(yw),by=c.camY==null?c.y:c.camY;
   out.p.set(c.x-fs*1.2*K,by+1.45*K,c.z-fc*1.2*K);out.l.set(c.x-fs*30,by+1.1*K,c.z-fc*30);out.f=62;c.cb=0;c.inTn=false;return}
  if(window.__camDbg&&c.human){const d=window.__camDbg,yw=c.yaw,sy_=Math.sin(yw),cy_=Math.cos(yw);out.p.set(c.x+cy_*d.s+sy_*d.f,c.y+d.h,c.z-sy_*d.s+cy_*d.f);out.l.set(c.x,c.y-.2,c.z);out.f=d.fov||34;return}
  const m=c.camX|0;if(!m||c.fin||c.respT>0)return;
  const K=P.carK?P.carK():1,yaw=c.cy!=null?c.cy:c.yaw,sy=Math.sin(yaw),cy=Math.cos(yaw),by=c.camY==null?c.y:c.camY;
  if(m===1){out.p.set(c.x-sy*11.5*K,by+4.6*K,c.z-cy*11.5*K);out.l.set(c.x+sy*7*K,by+.9*K,c.z+cy*7*K);out.f=52}
  else if(m===2){out.p.set(c.x-sy*5.2*K,by+.95*K,c.z-cy*5.2*K);out.l.set(c.x+sy*9*K,by+.7*K,c.z+cy*9*K);out.f=66}
  else if(m===3){out.p.set(c.x+sy*1.45*K,by+.62*K,c.z+cy*1.45*K);out.l.set(c.x+sy*26,by+.3*K,c.z+cy*26);out.f=78}
  else if(m===4){out.p.set(c.x+sy*.15*K,by+1.55*K,c.z+cy*.15*K);out.l.set(c.x+sy*26,by+1.1*K,c.z+cy*26);out.f=74}
  c.cb=0;c.inTn=false};
 /* Nov 13 (Hakan: the camera transition is still choppy; one that works for any car): whenever the view changes (a camera key, the hood or tunnel view,
    the finish orbit), the picture eases from where the lens was to where the new view wants it, over about 0.7 s with a soft start and end.
    It only looks at the lens position, aim and zoom, so it needs nothing from the car model. */
 const _fp=new V(),_fl=new V();
 soloCam=function(c,dt,out){inner.apply(this,arguments);try{if(!(c&&c.human))return;
  const key=(c.fin?1:0)+'|'+(c.tnB>.5?1:0)+'|'+(c.respT>0?1:0),ukey=((c.camX|0)+1)+(c._lb?'b':''),d=Math.min(.1,dt||.016);
  /* Nov 13 (Hakan): a camera the player picks (the camera key, look-behind) switches instantly; only views the game forces (bridge, finish, restart) are blended */
  if(c._uk!==ukey){c._uk=ukey;c._bt=1}
  const yw=c.cy!=null?c.cy:c.yaw,sy=Math.sin(yw),cy=Math.cos(yw);
  /* Nov 13 (Hakan: it shoots backwards, then forwards): the old view is kept as an offset from the car (along it, across it, up), not as a spot in the
     world, so while the blend runs the old lens travels with the car instead of being left behind and then chased */
  const loc=(p,o)=>{const dx=p.x-c.x,dz=p.z-c.z;o.f=dx*sy+dz*cy;o.s=dx*cy-dz*sy;o.y=p.y-c.y;return o},wld=(o,v)=>v.set(c.x+o.f*sy+o.s*cy,c.y+o.y,c.z+o.f*cy-o.s*sy);
  if(c._bk!==key&&c._bp){c._bk=key;c._bt=0;c._bfpL=loc(c._bp,{});c._bflL=loc(c._bl,{});c._bff=c._bf;c._bfp=wld(c._bfpL,new V());c._bfl=wld(c._bflL,new V())}else if(c._bk==null)c._bk=key;
  if(c._bt!=null&&c._bt<1){c._bt=Math.min(1,c._bt+d/.8);const u=c._bt,e=u*u*u*(u*(u*6-15)+10);
   wld(c._bfpL,c._bfp);wld(c._bflL,c._bfl);
   /* a jump of more than 60 m is a respawn or a restart: no slide */
   if(c._bfp.distanceTo(out.p)>60){c._bt=1}else{out.p.lerpVectors(c._bfp,out.p,e);out.l.lerpVectors(c._bfl,out.l,e);out.f=c._bff+(out.f-c._bff)*e}}
  c._bp=(c._bp||new V()).copy(out.p);c._bl=(c._bl||new V()).copy(out.l);c._bf=out.f}catch(e){}};
}
const _rc=new THREE.Raycaster(),_ro=new V(),_rd=new V();
function under(c,R_,m){const sc=R_.scene;if(!sc)return true;if(R_._ctM===undefined){let g=null;sc.traverse(o=>{if(o.name==='cartoonTrack')g=o});R_._ctM=g?g.children.filter(o=>!/road|GRASS|SAND|gravel|tarmac/i.test(o.name)):null}
 const ms=R_._ctM;if(!ms)return true;const K=P.carK?P.carK():1,yaw=c.cy!=null?c.cy:c.yaw,sy=Math.sin(yaw),cy=Math.cos(yaw),back=(m===1?11.5:7.5)*K,up=(m===1?4.6:3.1)*K,L=Math.hypot(back,up-1.3*K);
 _rd.set(-sy*back,up-1.3*K,-cy*back).normalize();_rc.far=L+.6;
 for(const d of[0,7,14,21]){_ro.set(c.x+sy*d,c.y+1.3*K,c.z+cy*d);_rc.set(_ro,_rd);if(_rc.intersectObjects(ms,false).length)return true}
 return false}
function orbit(c,dt,out,R_){
 const T=R_.T,K=P.carK?P.carK():1;let s=c._orb;
 if(!s){const yaw=c.cy!=null?c.cy:c.yaw;s=c._orb={a:Math.atan2(-Math.sin(yaw),-Math.cos(yaw)),r:10.5*K,h:3.6*K,t:0,pos:new V(c.x-Math.sin(yaw)*10*K,c.y+4*K,c.z-Math.cos(yaw)*10*K),look:new V(c.x,c.y+.7*K,c.z),f:50}}
 s.t+=dt;const base=s.a+s.t*.30;
 const tx=c.x,ty=c.y+.75*K,tz=c.z,hh=s.h+Math.sin(s.t*.45)*.7*K;
 /* obstruction: does a tree, pole or building stand between this angle and the car, or does terrain rise above the line? */
 const bx=T._bx,pts=bx&&bx.pts?bx.pts:null;
 const blocked=(ang,r,h)=>{const px=tx+Math.sin(ang)*r,pz=tz+Math.cos(ang)*r,py=ty+h;
  for(let k=1;k<=7;k++){const u=k/7,x=tx+(px-tx)*u,z=tz+(pz-tz)*u,y=ty+(py-ty)*u;const g=T.surf(x,z,y+40).h;if(g!=null&&g+.7>y)return 2}
  if(pts){const dx=px-tx,dz=pz-tz,L2=dx*dx+dz*dz;for(let i=0;i<pts.length;i++){const q=pts[i],ex=q[0]-tx,ez=q[1]-tz;if(ex*ex+ez*ez>(r+3)*(r+3))continue;const u=clamp((ex*dx+ez*dz)/L2,0,1),qx=tx+dx*u-q[0],qz=tz+dz*u-q[1],rad=(q[2]||.5)+1.1;if(qx*qx+qz*qz<rad*rad&&ty+(py-ty)*u<ty+9*K)return 1}}
  return 0};
 /* Nov 13 (Hakan: it jitters trying to avoid trees): the orbit is wider and higher to begin with, looks ahead along its own path, and every choice
    (angle, radius, height) is a slowly eased value, so it drifts out of the way of a tree before it gets there instead of snapping round it */
 const R0=s.r*1.3,H0=hh*1.25;let want=base,rT=R0,hT=H0;
 const bad=(a,r,h)=>blocked(a,r,h)||blocked(a+.28,r,h)||blocked(a+.56,r,h);
 if(bad(base+(s.off||0),R0,H0)){let found=false;for(const d of[.25,-.25,.5,-.5,.8,-.8,1.2,-1.2]){if(!bad(base+d,R0,H0)){want=base+d;found=true;break}}
  if(!found){for(const m of[1.25,1.55,1.9]){if(!bad(base,R0*(1+(m-1)*.5),H0*m)){rT=R0*(1+(m-1)*.5);hT=H0*m;found=true;break}}if(!found){hT=H0*2.2;rT=R0*.8}}}
 s.rr=s.rr==null?rT:s.rr+(rT-s.rr)*(1-Math.exp(-dt*1.4));s.hv=s.hv==null?hT:s.hv+(hT-s.hv)*(1-Math.exp(-dt*1.4));
 s.off=(s.off||0)+(wr(want-base)-(s.off||0))*(1-Math.exp(-dt*1.6));
 const ang=base+s.off,r=s.rr,h=s.hv,tp=_t.set(tx+Math.sin(ang)*r,ty+h,tz+Math.cos(ang)*r);
 const g=T.surf(tp.x,tp.z,tp.y+40).h;if(g!=null&&tp.y<g+1.6)tp.y=g+1.6;
 const k=1-Math.exp(-dt*3.2);s.pos.lerp(tp,k);s.look.lerp(_l.set(tx,ty,tz),1-Math.exp(-dt*7));s.f+=(50-s.f)*(1-Math.exp(-dt*4));
 out.p.copy(s.pos);out.l.copy(s.look);out.f=s.f;c.cb=0;c.inTn=false}
const _t=new V(),_l=new V();
/* ---------------- shift keys ---------------- */
const lbKey=(e,v)=>{if(e.code!=='ControlLeft'&&e.code!=='ControlRight')return;const R_=typeof RACE!=='undefined'?RACE:null;if(!R_||typeof scr==='undefined'||scr!=='game'||(R_.cfg&&R_.cfg.rally))return;const hs=humans();if(hs.length>2){hs.forEach(c=>c._lb=0);return}
 const c=e.code==='ControlLeft'?hs[0]:hs[1]||(hs.length===1?hs[0]:null);if(c){c._lb=v&&R_.state!=='count'?1:0;e.preventDefault()}};
addEventListener('keydown',e=>lbKey(e,1),true);addEventListener('keyup',e=>lbKey(e,0),true);addEventListener('blur',()=>humans().forEach(c=>c._lb=0));
addEventListener('keydown',e=>{
 const R_=typeof RACE!=='undefined'?RACE:null;if(!R_||R_.state==='done'||typeof scr==='undefined'||scr!=='game'||e.repeat)return;
 if(e.code!=='ShiftLeft'&&e.code!=='ShiftRight')return;if(R_.state==='count')return;if(R_.cfg&&R_.cfg.rally)return;
 const hs=humans(),c=e.code==='ShiftLeft'?hs[0]:hs[1]||(hs.length===1?hs[0]:null);if(!c||c.fin)return;
 c.camX=((c.camX|0)+1)%CAMN.length;P.sfx&&P.sfx('click')},true);
/* ---------------- early classification ---------------- */
const KEYSETS=[['KeyQ','KeyW','KeyE','KeyA','KeyS','KeyD'],['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Numpad8','Numpad4','Numpad5','Numpad6'],['KeyI','KeyJ','KeyK','KeyL'],['Numpad7','Numpad9','Numpad1','Numpad3']];
const dom=[];function dv(i){if(!dom[i]){const d=document.createElement('div');d.className='cbd';d.innerHTML='<div class="bx"></div>';document.body.appendChild(d);dom[i]={d,bx:d.firstChild,on:false}}return dom[i]}
const fmt=t=>P.fmtT?P.fmtT(t):t.toFixed(2);
function paint(i,c,R_){const o=dv(i),ord=[...R_.cars].sort((a,b)=>(b.fin?1e6-b.finT:0)-(a.fin?1e6-a.finT:0)||b.unw-a.unw),w=ord[0];
 o.bx.innerHTML='<h4>RACE<b>CLASSIFICATION</b></h4>'+ord.slice(0,6).map((q,n)=>{const hi=q.human?humans().indexOf(q):0,tm=q.fin?(n===0||!w.fin?fmt(q.finT):'+'+(q.finT-w.finT).toFixed(2)):'RACING';
  return '<div class="rw'+(q===c?' me':'')+'" style="--c:'+PC[hi%4]+'"><div class="rk">'+(n+1)+'</div><div class="nm">'+(q.ptName||'DRIVER')+'</div><div class="tm">'+tm+'</div></div>'}).join('')+'<div class="ft">ANY KEY TO CLOSE</div>';
 const r=c.rect||[0,0,1,1];o.d.style.left=(r[0]*100)+'%';o.d.style.top=((1-r[1]-r[3])*100)+'%';o.d.style.width=(r[2]*100)+'%';o.d.style.height=(r[3]*100)+'%'}
addEventListener('keydown',e=>{
 const R_=typeof RACE!=='undefined'?RACE:null;if(!R_||R_.state==='done'||scr!=='game'||e.repeat)return;
 const hs=humans();for(let i=0;i<hs.length&&i<4;i++){const c=hs[i];if(!c.fin)continue;
  if(KEYSETS[i].includes(e.code)){const o=dv(i);o.on=!o.on;if(o.on)paint(i,c,R_);o.d.classList.toggle('on',o.on);e.preventDefault();e.stopImmediatePropagation();return}}},true);
setInterval(()=>{const R_=typeof RACE!=='undefined'?RACE:null;if(!R_||R_.state==='done'||scr!=='game'){dom.forEach(o=>{if(o&&o.on){o.on=false;o.d.classList.remove('on')}});return}
 humans().forEach((c,i)=>{const o=dom[i];if(o&&o.on)paint(i,c,R_)})},400);
setTimeout(()=>{try{install()}catch(e){console.warn('camsys',e)}},120);
P.camX=c=>CAMN[c.camX|0];
})();
