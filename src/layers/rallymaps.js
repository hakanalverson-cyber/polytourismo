/* ===== Poly GT layer: rally maps (Nov 8, Hakan: "complete rally overhaul, all maps change to these" = the bought Cartoon Rally Track models of Finland,
   France, Portugal and Sweden). Each is a real point-to-point stage cut out of the model's road network by tools/cartoon_track/stage.py and replaces one of
   the four old rally stages (same slot, so records, medals and saves carry over). A stage file is a .ptrack with a "stage" block; cartoon.js hands it here.
   Driving model: the engine only knows closed loops, so the stage's road is closed out of sight (run-out past the finish, a chord back to the start) and the race
   ends after the fraction of the loop that is the stage. Invisible corridor walls line both sides of the route, so side roads and open fields are closed off.
   Stages skip the old procedural stage world completely (no terrain mesh, no scattered props): the model is the world. ===== */
(function rallymaps(){
'use strict';
const P=window.PT8;
if(!P||typeof D==='undefined'||typeof THREE==='undefined')return;
const SLOT={mangrove:'Mangrove Ford',terr:'Terrace Run',ash:'Ashfall Stage',autumn:'Autumn Ridge'};
P.stagePacks=P.stagePacks||{};
function addStagePack(pack){
 const k=pack.replaces;let i=D.findIndex(d=>d._key===k);if(i<0)i=D.findIndex(d=>d.name===SLOT[k]);
 if(i<0)throw new Error('This stage file is for a stage this game does not have ('+k+')');
 const d=D[i];
 if(d.cartoon&&(d.cartoon.rev||0)>(pack.rev||0)){const e=new Error('This is an older version of '+pack.name+' than the one already in the game');e.older=true;throw e}
 if(!d._orig)d._orig={name:d.name,desc:d.desc,pts:d.pts,fords:d.fords,hw:d.hw,medal:P.MEDAL_REF[i]};
 const L=pack.look||{};
 Object.assign(d,{name:pack.name,desc:pack.desc||d.desc,pts:pack.pts,cartoon:pack,stage:pack.stage,_key:k,bank:0,fords:undefined,jumps:[],walls:[],ice:[],boost:[],hard:0,crater:0,biome:'none',gravel:L.gravel!=null?L.gravel:1},L);
 d.hw=pack.stage.hwMed||d.hw;
 if(pack.medal)P.MEDAL_REF[i]=pack.medal;
 P.stagePacks[pack.id]=pack;if(P.ui&&P.ui.trClear)P.ui.trClear(i);
 return i}
P.addStagePack=addStagePack;
for(const p of P._stageQueue||[]){try{addStagePack(p)}catch(e){console.error('stage file',e)}}P._stageQueue=null;

/* ---- sampling: the finish index, ford list, bounds; the corner notes stop at the finish ---- */
const s0=sampleTrack;
sampleTrack=function(d){const T=s0.apply(this,arguments);const pk=d&&d.cartoon;if(!pk||!pk.stage)return T;
 const st=pk.stage,N=T.N;let bi=0,bd=1e18;for(let i=0;i<N;i++){const dx=T.x[i]-st.fin[0],dz=T.z[i]-st.fin[1],q=dx*dx+dz*dz;if(q<bd){bd=q;bi=i}}
 T.stage=st;T.finI=bi;
 let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(let i=0;i<=bi;i++){x0=Math.min(x0,T.x[i]);x1=Math.max(x1,T.x[i]);z0=Math.min(z0,T.z[i]);z1=Math.max(z1,T.z[i])}T.bounds=[x0-190,x1+190,z0-190,z1+190];
 T.fords=(st.fords||[]).map(f=>{let b=0,q0=1e18;for(let i=0;i<=bi;i++){const dx=T.x[i]-f.x,dz=T.z[i]-f.z,q=dx*dx+dz*dz;if(q<q0){q0=q;b=i}}
  return{i:b,x:T.x[b],z:T.z[b],y:T.y[b],yw:f.yw,psi:T.psi[b],w:f.w,L:f.L||44,s:Math.sin(T.psi[b]),c:Math.cos(T.psi[b])}});
 {const K=P.kappa(T);for(let i=bi+6;i<N-10;i++)K[i]=0}
 T.cps=null;return T};
const cp0=P.cpsOf;
P.cpsOf=T=>{if(!T.stage||!T.finI)return cp0(T);if(T.cps)return T.cps;const K=Math.max(3,Math.round(T.stage.len/900)),o=[];for(let k=1;k<=K;k++)o.push(Math.round(T.finI*k/(K+1)));return T.cps=o};
/* the race is over at the finish, not after a lap of the hidden return road */
const st0=step;
step=function(dt){const Rc=RACE;if(Rc&&Rc.T&&Rc.T.stage&&!Rc._stg){Rc._stg=1;if(Rc.cfg&&Rc.cfg.rally)Rc.laps=Rc.T.finI/Rc.T.N}return st0.apply(this,arguments)};

/* ---- the world: sky, fog and light only; the stage model (cartoon.js) is added on top ---- */
const hex=n=>'#'+(n>>>0).toString(16).padStart(6,'0');
function gradTex(a,b){const cv=document.createElement('canvas');cv.width=2;cv.height=64;const g=cv.getContext('2d'),q=g.createLinearGradient(0,0,0,64);q.addColorStop(0,hex(a));q.addColorStop(.5,hex(b));q.addColorStop(1,hex(b));g.fillStyle=q;g.fillRect(0,0,2,64);const t=new THREE.CanvasTexture(cv);t.encoding=THREE.sRGBEncoding;return t}
function stageScene(T){const d=T.d,sc=new THREE.Scene();
 sc.fog=new THREE.Fog(d.fog,150,620);sc.add(new THREE.HemisphereLight(d.hemi[0],d.hemi[1],1.1));const sun=new THREE.DirectionalLight(d.sun,1.0);sun.position.set(-150,250,100);sc.add(sun);
 const dm=new THREE.Mesh(new THREE.SphereGeometry(1500,16,12),new THREE.MeshBasicMaterial({map:gradTex(d.sky[0],d.sky[1]),side:THREE.BackSide,fog:false}));dm.frustumCulled=false;dm.userData.skyAt=[0,null,0];sc.userData.skyRide=1;sc.add(dm);
 styleScene(sc);return sc}
const bw=buildWorld;
buildWorld=function(T){if(T.d&&T.d.stage&&T.d.cartoon){if(!T.bounds)T.bounds=[-500,500,-500,500];return stageScene(T)}return bw.apply(this,arguments)};

/* ---- start and finish gates (added after cartoon.js has cleared the stock scenery) ---- */
function bannerTex(txt){const cv=document.createElement('canvas');cv.width=512;cv.height=96;const g=cv.getContext('2d');
 g.fillStyle='#0a0d11';g.fillRect(0,0,512,96);g.strokeStyle='#f1f3f5';g.lineWidth=4;g.strokeRect(4,4,504,88);
 g.fillStyle='#f2c76b';g.font='600 46px "PT Inter",monospace';g.textAlign='center';g.textBaseline='middle';g.fillText(txt.split('').join(' '),256,52);
 const t=new THREE.CanvasTexture(cv);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;return t}
function checkTex(){const cv=document.createElement('canvas');cv.width=16;cv.height=2;const g=cv.getContext('2d');for(let i=0;i<16;i++){g.fillStyle=i&1?'#f1f3f5':'#0a0d11';g.fillRect(i,0,1,1);g.fillStyle=i&1?'#0a0d11':'#f1f3f5';g.fillRect(i,1,1,1)}
 const t=new THREE.CanvasTexture(cv);t.magFilter=t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.encoding=THREE.sRGBEncoding;return t}
function gate(sc,T,i,txt){const hw=T.hw[i]+1.3,g=new THREE.Group();g.position.set(T.x[i],T.y[i],T.z[i]);g.rotation.y=T.psi[i];
 const post=new THREE.MeshLambertMaterial({color:0x2a2f36}),pm=new THREE.BoxGeometry(.9,9,.9);
 for(const s of[-1,1]){const m=new THREE.Mesh(pm,post);m.position.set(s*hw,4.5,0);g.add(m)}
 const beam=new THREE.Mesh(new THREE.BoxGeometry(hw*2+.9,.7,.8),post);beam.position.set(0,9,0);g.add(beam);
 const bm=new THREE.MeshBasicMaterial({map:bannerTex(txt),side:THREE.DoubleSide,fog:false}),w=Math.min(hw*1.8,13);const sg=new THREE.Mesh(new THREE.PlaneGeometry(w,w*96/512),bm);sg.position.set(0,7.6,.02);g.add(sg);
 const ck=new THREE.Mesh(new THREE.PlaneGeometry(hw*2-.4,1.8),new THREE.MeshBasicMaterial({map:checkTex(),fog:false}));ck.rotation.x=-Math.PI/2;ck.position.set(0,.14,0);g.add(ck);
 g.userData.noMerge=1;sc.add(g)}
setTimeout(()=>{const bw2=buildWorld;buildWorld=function(T){const sc=bw2.apply(this,arguments);try{if(T.d&&T.d.stage&&T.d.cartoon&&T.finI){gate(sc,T,2,'START');gate(sc,T,T.finI,'FINISH')}}catch(e){console.warn('gates',e)}return sc}},0);
})();
