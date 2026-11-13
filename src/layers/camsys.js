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
 soloCam=function(c,dt,out){
  const R_=typeof RACE!=='undefined'?RACE:null;
  if(!(c&&c.human&&R_&&R_.T)||(R_.cfg&&R_.cfg.rally)||R_.state==='count'&&!c.fin)return prev.apply(this,arguments);
  /* finished: the drone orbit (the old random cinematic is bypassed) */
  if(c.fin&&c.cool&&R_.state!=='done'||c.fin&&R_.state==='done'&&R_._orbOn){orbit(c,dt,out,R_);return}
  c._orb=null;
  /* under a bridge the view only drops to the bonnet when the bridge would really hide the car from this camera: never in the bonnet, bumper or
     low views, and in the chase views only if the deck sits on the line between the camera and the car (checked against the model, then held until clear) */
  if(c.inTn){const m0=c.camX|0;if(m0>=2){c.inTn=false;c.tnB=0;c._tnL=0}else{if(!c._tnL&&under(c,R_,m0))c._tnL=1;if(!c._tnL)c.inTn=false}}else c._tnL=0;
  prev.apply(this,arguments);
  if(window.__camDbg&&c.human){const d=window.__camDbg,yw=c.yaw,sy_=Math.sin(yw),cy_=Math.cos(yw);out.p.set(c.x+cy_*d.s+sy_*d.f,c.y+d.h,c.z-sy_*d.s+cy_*d.f);out.l.set(c.x,c.y-.2,c.z);out.f=d.fov||34;return}
  const m=c.camX|0;if(!m||c.fin||c.respT>0)return;
  const K=P.carK?P.carK():1,yaw=c.cy!=null?c.cy:c.yaw,sy=Math.sin(yaw),cy=Math.cos(yaw),by=c.camY==null?c.y:c.camY;
  if(m===1){out.p.set(c.x-sy*11.5*K,by+4.6*K,c.z-cy*11.5*K);out.l.set(c.x+sy*7*K,by+.9*K,c.z+cy*7*K);out.f=52}
  else if(m===2){out.p.set(c.x-sy*5.2*K,by+.95*K,c.z-cy*5.2*K);out.l.set(c.x+sy*9*K,by+.7*K,c.z+cy*9*K);out.f=66}
  else if(m===3){out.p.set(c.x+sy*1.45*K,by+.62*K,c.z+cy*1.45*K);out.l.set(c.x+sy*26,by+.3*K,c.z+cy*26);out.f=78}
  else if(m===4){out.p.set(c.x+sy*.15*K,by+1.55*K,c.z+cy*.15*K);out.l.set(c.x+sy*26,by+1.1*K,c.z+cy*26);out.f=74}
  c.cb=0;c.inTn=false};
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
 /* keep the angle that is clear, searching outwards from the drifting one; the chosen angle eases, never jumps */
 let want=base,r=s.r,h=hh;
 if(blocked(base,r,h)){let found=false;for(const d of[.22,-.22,.45,-.45,.75,-.75,1.1,-1.1]){const a=base+d;if(!blocked(a,r,h)){want=a;found=true;break}}
  if(!found){for(const rs of[.78,.6]){if(!blocked(base,r*rs,h*1.25)){r=r*rs;h=h*1.25;found=true;break}}if(!found){h=hh*1.9;r=s.r*.7}}}
 /* the base angle keeps turning; the offset to the clear angle eases in and out */
 s.off=(s.off||0)+(wr(want-base)-(s.off||0))*(1-Math.exp(-dt*3));
 const ang=base+s.off,tp=_t.set(tx+Math.sin(ang)*r,ty+h,tz+Math.cos(ang)*r);
 const g=T.surf(tp.x,tp.z,tp.y+40).h;if(g!=null&&tp.y<g+1.6)tp.y=g+1.6;
 const k=1-Math.exp(-dt*5);s.pos.lerp(tp,k);s.look.lerp(_l.set(tx,ty,tz),1-Math.exp(-dt*7));s.f+=(50-s.f)*(1-Math.exp(-dt*4));
 out.p.copy(s.pos);out.l.copy(s.look);out.f=s.f;c.cb=0;c.inTn=false}
const _t=new V(),_l=new V();
/* ---------------- shift keys ---------------- */
addEventListener('keydown',e=>{
 const R_=typeof RACE!=='undefined'?RACE:null;if(!R_||R_.state==='done'||typeof scr==='undefined'||scr!=='game'||e.repeat)return;
 if(e.code!=='ShiftLeft'&&e.code!=='ShiftRight')return;if(R_.cfg&&R_.cfg.rally)return;
 const hs=humans(),c=e.code==='ShiftLeft'?hs[0]:hs[1]||(hs.length===1?hs[0]:null);if(!c||c.fin)return;
 c.camX=((c.camX|0)+1)%CAMN.length;toast((hs.length>1?'P'+(hs.indexOf(c)+1)+'  ':'')+CAMN[c.camX]);P.sfx&&P.sfx('click')},true);
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
