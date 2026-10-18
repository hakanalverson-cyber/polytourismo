/* ===== Poly Tourismo v9 layer: perf (adaptive render scale + shadow throttling, HUD DOM caching) ===== */
(function v9perf(){
'use strict';
const P=window.PT8,cv=R.domElement,dpr=Math.min(devicePixelRatio||1,2);
const on=()=>!window.PTO||PTO.adaptive!==false;
/* base scale: never render more than ~1.5x CSS pixels unless the machine proves it can */
const S0=dpr>1.5?1.5/dpr:1;
const LV=[{s:1,sh:1,sz:2048},{s:.86,sh:1,sz:2048},{s:.86,sh:2,sz:2048},{s:.72,sh:2,sz:1536},{s:.6,sh:3,sz:1024}];
let lv=0,frames=0,ema=16.7,lastChange=performance.now(),last=performance.now(),fcount=0;const badUntil=[0,0,0,0,0],badLen=[30000,30000,30000,30000,30000];
const factor=()=>(scr==='game'&&on())?S0*LV[lv].s:1;
P.perf={get level(){return lv},get scale(){return factor()},set level(v){lv=Math.max(0,Math.min(4,v|0));rs()}};

const rs1=rs;
rs=()=>{rs1();const f=factor();if(f<.999&&typeof PX!=='undefined'&&PX===1&&!(P.studioDbg&&P.studioDbg.on)&&!document.body.classList.contains('studio')){R.setSize(Math.max(2,Math.round(cv.width*f)),Math.max(2,Math.round(cv.height*f)),false);cv.style.imageRendering='auto'}
 else if(scr==='game'||f>=.999){if(!document.body.classList.contains('studio'))cv.style.imageRendering=''}};
const sh1=show;show=function(n){const r=sh1.apply(this,arguments);try{rs()}catch(e){}return r};

/* shadow throttling */
const rr=R.render.bind(R);let curSz=2048;
R.render=function(scene,cam){
 if(scr==='game'&&on()&&scene&&scene.userData&&scene.userData.sun){const L=LV[lv],sun=scene.userData.sun,single=!RACE||RACE.cars.filter(c=>c.human).length<=1;
  if(sun.shadow&&sun.shadow.mapSize.x!==L.sz){sun.shadow.mapSize.set(L.sz,L.sz);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null}}
  if(L.sh>1&&single){R.shadowMap.autoUpdate=false;if(fcount%L.sh===0)R.shadowMap.needsUpdate=true}else R.shadowMap.autoUpdate=true}
 else R.shadowMap.autoUpdate=true;
 return rr(scene,cam)};

/* frame-time governor: 1.5 s windows; drop a level when the average frame is slow, climb back (one level, after 9 s) when it is comfortably fast */
let wSum=0,wN=0,wStart=0,good=0;
function loop(now){requestAnimationFrame(loop);fcount++;const dt=now-last;last=now;
 if(dt>1500||document.hidden||scr!=='game'||paused||!on()){wSum=wN=0;wStart=now;good=0;return}
 if(!wStart)wStart=now;wSum+=dt;wN++;
 if(now-wStart<1500||wN<6)return;const avg=wSum/wN;wSum=wN=0;wStart=now;
 if(avg>21.5&&lv<4){badUntil[lv]=now+badLen[lv];badLen[lv]=Math.min(120000,badLen[lv]*1.6);lv++;good=0;lastChange=now;rs()}
 else if(avg<18.2&&lv>0&&now-lastChange>9000&&now>badUntil[lv-1]){if(++good>=2){lv--;good=0;lastChange=now;rs()}}else if(avg>=18.2)good=0}
requestAnimationFrame(loop);

/* HUD: don't rebuild identical markup every frame (forces layout) */
{const d=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');
 Object.defineProperty(Element.prototype,'innerHTML',{get:d.get,configurable:true,set(v){const c=this.classList;if(c&&(c.contains('h8mode')||c.contains('cond')||c.contains('h8fin'))){if(this._ih===v)return;this._ih=v}d.set.call(this,v)}})}
})();
