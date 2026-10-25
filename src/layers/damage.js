/* ===== Poly Tourismo v9 layer: damage (optional in every mode: bin it and the car really is hurt) ===== */
(function v9damage(){
'use strict';
const P=window.PT8;
P.dmgOn=Rc=>{const c=Rc&&Rc.cfg;return !!c&&(c.dmg!==undefined?!!c.dmg:!!c.rally)};
/* outside rally the rally layer's multipliers don't run, so a hurt car loses power / grip here */
const m0=P.mul;P.mul=c=>{const m=m0(c);const Rc=RACE;if(c.human&&c.dmg>0&&!(Rc&&Rc.cfg&&Rc.cfg.rally)){const dm=c.dmg;m.acc*=1-.5*Math.pow(dm,1.2);m.top*=1-.32*dm;m.grip*=1-.14*dm;m.brk*=1-.3*dm}return m};
const st0=step;step=function(dt){st0.apply(this,arguments);try{const Rc=RACE;if(!Rc||!Rc.cfg||Rc.cfg.rally)return;const on=P.dmgOn(Rc);let first=null;
 for(const c of Rc.cars){if(!c.human)continue;if(c.cdT>0)c.cdT-=dt;if(on&&P.smokeFx)P.smokeFx(c,Rc,dt);if(!first)first=c}
 const hs=Rc.cars.filter(c=>c.human);if(on&&hs.length>1&&Rc.state==='race')multiStat(Rc);else{hideMulti();if(on&&first&&Rc.state==='race'&&P.statUpdate)P.statUpdate(Rc,first)}}catch(e){if(!P._dErr){P._dErr=1;console.warn('damage',e)}}};
/* split screen: every player gets their own damage plate, beside their own lap clock */
{const st=document.createElement('style');st.textContent='.ptDmgP{position:fixed;z-index:20;display:none;flex-direction:column;gap:6px;pointer-events:none}.ptDmgP .h8top{position:static;transform:scale(var(--s,1));transform-origin:top left;width:var(--pw,auto);height:var(--ph,auto);box-sizing:border-box}.ptDmgP .h8plate{flex:1;min-width:0}';document.head.appendChild(st)}
const MS=[];function hideMulti(){for(const e of MS)if(e)e.style.display='none'}
function multiStat(Rc){Rc.cars.forEach((c,i)=>{if(!c.human)return;let e=MS[i];if(!e){e=MS[i]=document.createElement('div');e.className='ptDmgP';document.body.appendChild(e)}
  const dv=Math.round((c.dmg||0)*100),col=dv>=50?'#ef6a5a':dv>=20?'#f2c76b':'';const k=String(dv);if(e._k!==k){e._k=k;e.innerHTML=`<div class="h8top"><div class="h8plate"><div class="lap">${Rc.cars.filter(q=>q.human).length>1?'P'+((c.k|0)+1)+' ':''}DAMAGE</div><div class="raceTime" style="${col?'color:'+col:''}">${dv}%</div><div class="bl"></div></div></div>`}
  const ht=document.querySelector('#h'+i+' .h8top');if(!ht||!ht.offsetWidth){e.style.display='none';return}const rc=ht.getBoundingClientRect();e.style.left=(rc.right+8)+'px';e.style.top=rc.top+'px';e.style.setProperty('--pw',ht.offsetWidth+'px');e.style.setProperty('--ph',ht.offsetHeight+'px');const pv=ht.parentNode.style.getPropertyValue('--s');if(pv)e.style.setProperty('--s',pv);e.style.display='flex'});
 const st=document.getElementById('rlStat');if(st)st.style.display='none'}
const sh0=show;show=function(id){if(id!=='game'&&id!=='pause'){const e=document.getElementById('rlStat');if(e)e.style.display='none';hideMulti()}return sh0.apply(this,arguments)};
/* ---- impact sparks + flying debris ---- */
const rr=(a,b)=>a+Math.random()*(b-a),dbG=new THREE.BoxGeometry(1,1,1),dbM={};
const dbMat=col=>dbM[col]||(dbM[col]=new THREE.MeshStandardMaterial({color:col,roughness:.7}));
P.hitFx=(Rc,c,v,x,y,z,nx,nz)=>{if(!Rc||!Rc.scene||!(v>2.5))return;const now=performance.now();if(c){if(c._fxT&&now-c._fxT<220)return;c._fxT=now}
 const n=Math.min(18,Math.round(4+v*.9));
 for(let k=0;k<n;k++)P.puff(x,y,z,nx*rr(2,9)+rr(-4,4),rr(1.5,7),nz*rr(2,9)+rr(-4,4),k%3?[1,.82,.3]:[1,.55,.15],rr(.07,.15),rr(.25,.55),1,14);
 for(let k=0;k<4;k++)P.puff(x,y,z,nx*rr(1,4)+rr(-1.5,1.5),rr(.8,2.6),nz*rr(1,4)+rr(-1.5,1.5),[.5,.48,.46],rr(.5,1),rr(.5,.9),.3,-.4);
 const v7=Rc.v7||(Rc.v7={deb:[],ball:[]}),cnt=Math.min(7,Math.floor(v/2.6)),pal=[0x1e1e22,0x7a7d82,c&&c.col!=null?c.col:0x999999];
 for(let k=0;k<cnt&&v7.deb.length<80;k++){const m=new THREE.Mesh(dbG,dbMat(pal[k%3])),s=rr(.08,.24);m.scale.set(s*rr(1,2.2),s*.5,s*rr(1,2.2));m.position.set(x,y,z);Rc.scene.add(m);
  v7.deb.push({m,t:1.35,vx:nx*rr(2,8)+rr(-4,4),vy:rr(4,10),vz:nz*rr(2,8)+rr(-4,4),rx:rr(-9,9),rz:rr(-9,9)})}};
P.scrapeFx=(c,x,y,z,vt,nx,nz)=>{const sp=Math.hypot(c.vx,c.vz)||1,dx=c.vx/sp,dz=c.vz/sp;for(let k=0;k<3;k++)P.puff(x,y,z,-dx*rr(.5,3)+nx*rr(0,3)+rr(-1.5,1.5),rr(1,4),-dz*rr(.5,3)+nz*rr(0,3)+rr(-1.5,1.5),[1,.8,.3],rr(.05,.11),rr(.18,.4),1,14)};
window.__hitFx=(x,y,z,v,a,b)=>{const Rc=RACE;P.hitFx(Rc,a,v,x,y,z,0,0);P.hitFx(Rc,b,v,x,y,z,0,0)};
})();
