/* ===== Poly Tourismo v9 layer: weather (rain, storm, fog) ===== */
(function v9weather(){
'use strict';
const P=window.PT8;
const WX={
 clear:{n:'CLEAR'},
 rain:{n:'RAIN',grip:.84,brk:.88,sun:.5,hemi:.85,fog:[.55,.6],dark:.9,rain:2400,snd:.5},
 storm:{n:'STORM',grip:.74,brk:.8,sun:.32,hemi:.7,fog:[.35,.45],dark:.72,rain:4200,snd:.9,thunder:1},
 fog:{n:'FOG',grip:1,brk:1,sun:.6,hemi:.95,fog:[0,0],dark:.95,rain:0,snd:0,thick:1}};
P.WX=WX;P.WX_ORDER=['clear','rain','storm','fog'];
const wx=Rc=>{const k=Rc&&Rc.cfg&&Rc.cfg.weather;return k&&WX[k]&&k!=='clear'?WX[k]:null};
P.wxOf=wx;
const desat=(hex,k,dark)=>{const c=new THREE.Color(hex),l=(c.r+c.g+c.b)/3;c.r=(c.r+(l-c.r)*k)*dark;c.g=(c.g+(l-c.g)*k)*dark;c.b=(c.b+(l*1.04-c.b)*k)*dark;return c};

/* ---- scene look ---- */
function applyLook(Rc,w){const sc=Rc.scene,T=Rc.T,d=T.d,key=P.curTod||'day',t=P.TOD[key],sky=(t&&t.sky)||d.sky;
 for(const o of sc.children){
  if(o.isHemisphereLight){o.intensity*=w.hemi;o.color.copy(desat(o.color.getHex(),.5,1));o.groundColor.copy(desat(o.groundColor.getHex(),.5,1))}
  else if(o.isDirectionalLight){o.intensity*=w.sun;o.color.copy(desat(o.color.getHex(),.5,1))}
  else if(o.geometry&&o.geometry.type==='SphereGeometry'&&o.geometry.parameters.radius===1500){
   const a=desat(sky[0],.8,w.dark).getStyle(),b=desat(sky[1],.85,w.dark).getStyle();
   o.material.map=ctex(2,64,(x,W,H)=>{const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,a);g.addColorStop(.5,b);g.addColorStop(1,b);x.fillStyle=g;x.fillRect(0,0,W,H)});o.material.needsUpdate=true}
 }
 if(sc.fog){const fc=desat(sc.fog.color.getHex(),.8,w.dark);sc.fog.color.copy(fc);
  if(w.thick){sc.fog.near=6;sc.fog.far=Math.min(sc.fog.far,150)}else{sc.fog.near*=w.fog[0];sc.fog.far*=w.fog[1]}
  const f2=sc.userData.ptFog;if(f2){f2.color.copy(fc);f2.near=sc.fog.near;f2.far=sc.fog.far}}
 const U=window.TODU;if(U){U.sat.value*=.88}
}

/* ---- grip: every car gets a wet-weather stat copy (AI braking/corner speeds adapt automatically) ---- */
function applyGrip(Rc,w){const g=Rc.T.d.gravel,k=g?.7:1,gf=1-(1-w.grip)*k,bf=1-(1-w.brk)*k;
 for(const c of Rc.cars){const cs=c.cs;c.cs=Object.assign({},cs,{grip:cs.grip*gf,brk:cs.brk*bf})}
 Rc.wxGrip=Math.round((gf-1)*100)}

/* ---- rain streaks (GPU): one box of drops that follows each human car ---- */
const VS=`uniform vec3 uCar;uniform vec3 uVel;uniform float uT;attribute vec3 seed;attribute float tail;varying float vA;
void main(){vec3 b=vec3(64.,34.,64.);vec3 p=seed*b;p.y=mod(p.y-uT*(30.+seed.x*8.),b.y);vec3 rel=mod(p+vec3(0.,uCar.y,0.)-uCar+b*.5,b)-b*.5;vec3 wp=uCar+rel;
vec3 dir=normalize(vec3(-uVel.x*.035,-1.,-uVel.z*.035));wp-=dir*tail*(.9+seed.z*.8);vA=1.-smoothstep(18.,32.,length(rel.xz))*1.;vA*=mix(1.,.35,tail);
gl_Position=projectionMatrix*viewMatrix*vec4(wp,1.);}`;
const FS=`varying float vA;uniform float uAl;void main(){gl_FragColor=vec4(.78,.84,.92,vA*uAl);}`;
function makeRain(n,al){const g=new THREE.BufferGeometry(),s=new Float32Array(n*2*3),t=new Float32Array(n*2);
 for(let i=0;i<n;i++){const a=Math.random(),b=Math.random(),c=Math.random();for(let k=0;k<2;k++){const o=(i*2+k)*3;s[o]=a;s[o+1]=b;s[o+2]=c;t[i*2+k]=k}}
 g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(n*2*3),3));g.setAttribute('seed',new THREE.BufferAttribute(s,3));g.setAttribute('tail',new THREE.BufferAttribute(t,1));
 const m=new THREE.ShaderMaterial({vertexShader:VS,fragmentShader:FS,transparent:true,depthWrite:false,fog:false,uniforms:{uCar:{value:new THREE.Vector3()},uVel:{value:new THREE.Vector3()},uT:{value:0},uAl:{value:al}}});
 const o=new THREE.LineSegments(g,m);o.frustumCulled=false;o.renderOrder=20;return o}

/* ---- rain + thunder audio ---- */
const A={on:false};
function audioInit(){try{AC=AC||new AudioContext();if(AC.state==='suspended')AC.resume();if(A.g)return true;
 const n=AC.sampleRate*2|0,b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;
 A.src=AC.createBufferSource();A.src.buffer=b;A.src.loop=true;
 A.hp=AC.createBiquadFilter();A.hp.type='bandpass';A.hp.frequency.value=3200;A.hp.Q.value=.35;
 A.lo=AC.createBiquadFilter();A.lo.type='lowpass';A.lo.frequency.value=700;
 A.g=AC.createGain();A.g.gain.value=0;A.g2=AC.createGain();A.g2.gain.value=0;
 A.src.connect(A.hp);A.hp.connect(A.g);A.g.connect(AC.destination);A.src.connect(A.lo);A.lo.connect(A.g2);A.g2.connect(AC.destination);A.src.start();A.buf=b;return true}catch(e){return false}}
function thunder(){if(!audioInit())return;try{const s=AC.createBufferSource();s.buffer=A.buf;const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=260;const g=AC.createGain(),t=AC.currentTime+.25;
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.9,t+.15);g.gain.exponentialRampToValueAtTime(.001,t+2.8);s.connect(f);f.connect(g);g.connect(AC.destination);s.start(t,Math.random(),3)}catch(e){}}

/* ---- setup after launch ---- */
const l0=P.launch;
P.launch=cfg=>{l0(cfg);const Rc=RACE,w=wx(Rc);if(!Rc)return;
 Rc.wx=w;if(!w){if(A.g){A.g.gain.value=0;A.g2.gain.value=0}return}
 applyLook(Rc,w);applyGrip(Rc,w);
 Rc.rains=[];if(w.rain){for(const c of Rc.cars){if(!c.human)continue;const r=makeRain(Math.round(w.rain/Math.max(1,Rc.cars.filter(h=>h.human).length*.6)),.7);Rc.scene.add(r);Rc.rains.push([c,r])}}
 Rc.wxT=0;Rc.flash=0;Rc.nextBolt=8+Math.random()*10;
 Rc.hemi=Rc.scene.children.find(o=>o.isHemisphereLight);Rc.hemi0=Rc.hemi?Rc.hemi.intensity:1;
 if(w.snd)audioInit()};

const st0=step;
step=dt=>{st0(dt);const Rc=RACE;if(!Rc||!Rc.wx)return;const w=Rc.wx;Rc.wxT+=dt;
 for(const [c,r] of Rc.rains||[]){const u=r.material.uniforms;u.uCar.value.set(c.x,c.y,c.z);u.uVel.value.set(c.vx,0,c.vz);u.uT.value=Rc.wxT}
 /* audio: only while actually playing */
 if(A.g){const live=w.snd&&scr==='game'&&!paused&&Rc.state!=='done';const t=AC.currentTime;A.g.gain.setTargetAtTime(live?.11*w.snd:0,t,.2);A.g2.gain.setTargetAtTime(live?.07*w.snd:0,t,.3)}
 if(w.thunder&&Rc.state==='race'){Rc.nextBolt-=dt;if(Rc.nextBolt<=0){Rc.nextBolt=12+Math.random()*18;Rc.flash=.5;thunder()}}
 if(Rc.flash>0){Rc.flash=Math.max(0,Rc.flash-dt);if(Rc.hemi)Rc.hemi.intensity=Rc.hemi0*(1+2.2*Math.pow(Rc.flash/.5,2)*(Math.floor(Rc.flash*14)%2?1:.45))}else if(Rc.hemi)Rc.hemi.intensity=Rc.hemi0};

/* HUD tag */
const hu0=hudUpdate;hudUpdate=()=>{hu0();const Rc=RACE;if(!Rc||!Rc.wx)return;
 Rc.cars.forEach((c,i)=>{if(!c.human)return;const e=document.getElementById('h'+i);if(!e||!e.dataset.b)return;const l=e.querySelector('.lap');if(l)l.textContent+=' · '+Rc.wx.n+(Rc.wxGrip<0?' '+Rc.wxGrip+'%':'')})};
})();
