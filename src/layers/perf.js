/* ===== Poly Tourismo v9 layer: perf (performance options: presets, pixel density cap, FPS counter, HUD DOM caching) ===== */
(function v9perf(){
'use strict';
const P=window.PT8,cv=R.domElement,dpr=devicePixelRatio||1,O=()=>window.PTO||{};
const PRE={
 MINIMUM:{maxDensity:1,resolution:.75,shadows:true,shadowRate:4,shadowRes:512,effects:1},
 LOW:{maxDensity:1,resolution:.9,shadows:true,shadowRate:3,shadowRes:1024,effects:1},
 MEDIUM:{maxDensity:1.25,resolution:1,shadows:true,shadowRate:2,shadowRes:1024,effects:2},
 HIGH:{maxDensity:1.5,resolution:1,shadows:true,shadowRate:2,shadowRes:1536,effects:2},
 ULTRA:{maxDensity:2,resolution:1,shadows:true,shadowRate:1,shadowRes:2048,effects:2}};
let lastPP=O().perfPreset;
/* called at the top of the options apply(): applies a chosen preset, or flips to CUSTOM when a value is edited by hand */
P.perfPre=()=>{const o=O(),pr=PRE[o.perfPreset];if(o.perfPreset!==lastPP){lastPP=o.perfPreset;if(pr)Object.assign(o,pr);return}
 if(pr){for(const k in pr)if(o[k]!==pr[k]){o.perfPreset=lastPP='CUSTOM';break}}};
P.PERF_PRESETS=PRE;
/* render size = screen pixels x min(device density, cap) x render scale */
const rs1=rs;
rs=()=>{rs1();if(document.body.classList.contains('studio')||(typeof PX!=='undefined'&&PX!==1))return;const o=O(),d2=Math.min(dpr,2),f=Math.min(dpr,o.maxDensity||1.5)/d2*(o.resolution||1);
 if(Math.abs(f-1)>.002){R.setSize(Math.max(2,Math.round(cv.width*f)),Math.max(2,Math.round(cv.height*f)),false);cv.style.imageRendering='auto'}else cv.style.imageRendering=''};
/* FPS counter */
let fe=null,n=0,t0=performance.now(),worst=0,lt=t0;
(function loop(now){requestAnimationFrame(loop);const d=now-lt;lt=now;n++;if(d>worst)worst=d;
 if(now-t0>=500){const fps=n*1000/(now-t0);if(O().showFps){if(!fe){fe=document.createElement('div');fe.style.cssText='position:fixed;top:6px;left:50%;transform:translateX(-50%);z-index:99999;font:700 11px monospace;letter-spacing:.12em;color:#ffc9a0;background:#000a;padding:3px 8px;pointer-events:none';document.body.appendChild(fe)}
  fe.style.display='';fe.textContent=Math.round(fps)+' FPS  '+(1000/fps).toFixed(1)+' ms  (worst '+Math.round(worst)+' ms)  '+R.domElement.width+'x'+R.domElement.height}else if(fe)fe.style.display='none';
  n=0;t0=now;worst=0}})(performance.now());
/* HUD: don't rebuild identical markup every frame (forces layout) */
{const d=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');
 Object.defineProperty(Element.prototype,'innerHTML',{get:d.get,configurable:true,set(v){const c=this.classList;if(c&&(c.contains('h8mode')||c.contains('cond')||c.contains('h8fin'))){if(this._ih===v)return;this._ih=v}d.set.call(this,v)}})}
rs();
})();
