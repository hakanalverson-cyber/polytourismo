/* ===== layer: race distance marker (replaces the round minimap in races and rally). A thin GT-style line from start to finish,
   a flag at the end, kilometre ticks, and triangles: one for each human plus, for a single player, a second one for the rival
   (the leader, or the nearest car ahead, or the ghost of an earlier run in rally). ===== */
(function distbar(){
'use strict';
const P=window.PT8;if(!P)return;
const css=document.createElement('style');css.textContent=`
body.dtm #mm{display:none!important}
#dtm{position:fixed;top:14px;right:18px;width:clamp(230px,27vw,380px);z-index:6;pointer-events:none;display:none;color:#fff;font-family:var(--gt,Inter,sans-serif);text-shadow:0 1px 3px #000c}
#dtm.on{display:block}
#dtm .dh{display:flex;justify-content:space-between;align-items:baseline;font:italic 800 10px var(--gt);letter-spacing:.3em;color:#cfd8de;margin-bottom:4px}
#dtm .dh b{font:italic 800 19px var(--gt);letter-spacing:.04em;color:#fff}
#dtm .dh b small{font:700 10px var(--gt);letter-spacing:.2em;color:#aab6bf;margin-left:4px}
#dtm .tr{position:relative;height:34px}
#dtm .ln{position:absolute;left:0;right:0;top:16px;height:3px;border-radius:2px;background:#ffffff40;box-shadow:0 0 0 1px #0007}
#dtm .fl{position:absolute;left:0;top:16px;height:3px;border-radius:2px;background:linear-gradient(90deg,#9fd8ff,#fff)}
#dtm .tk{position:absolute;top:13px;width:1px;height:9px;background:#ffffff66}
#dtm .fg{position:absolute;right:-2px;top:6px;width:14px;height:26px;border-radius:2px;background:repeating-conic-gradient(#fff 0 25%,#111 0 50%) 0 0/7px 7px;box-shadow:0 0 0 1px #000a}
#dtm .st{position:absolute;left:-1px;top:11px;width:3px;height:13px;background:#fff;border-radius:1px}
#dtm .tg{position:absolute;width:0;height:0;margin-left:-8px;transition:left .12s linear}
#dtm .tg.up{top:2px;border-left:8px solid transparent;border-right:8px solid transparent;border-top:13px solid var(--c,#9fd8ff);filter:drop-shadow(0 1px 2px #000b)}
#dtm .tg.dn{top:21px;border-left:8px solid transparent;border-right:8px solid transparent;border-bottom:13px solid var(--c,#ffffffaa);filter:drop-shadow(0 1px 2px #000b)}
#dtm .tg i{position:absolute;left:-14px;width:36px;text-align:center;font:italic 800 9px var(--gt);letter-spacing:.06em;color:#fff;font-style:normal}
#dtm .tg.up i{top:-12px}#dtm .tg.dn i{top:14px}
body.rprep #dtm,body.barnscene #dtm{display:none!important}
`;document.head.appendChild(css);
const el=document.createElement('div');el.id='dtm';
el.innerHTML='<div class="dh"><span id="dtL">DISTANCE</span><b id="dtR">0.0<small>KM TO GO</small></b></div><div class="tr"><div class="ln"></div><div class="fl" id="dtF"></div><div class="st"></div><div class="fg"></div></div>';
document.body.appendChild(el);
const $=id=>document.getElementById(id),tgs=[];
const PC=['#9fd8ff','#ffb347','#8ef08a','#ff7a9a'];
function tg(n,cls){let t=tgs[n];if(!t){t=document.createElement('div');t.className='tg';t.innerHTML='<i></i>';el.querySelector('.tr').appendChild(t);tgs[n]=t}t.className='tg '+cls;return t}
let tkN=-1;
function prog(c,T,end,lapped){/* 0..1 along the run */
 const N=T.N;let u=c.unw!=null?c.unw:c.idx;if(!lapped){if(u<0)u=0;return Math.max(0,Math.min(1,u/end))}
 const lp=(c.lap||0);return Math.max(0,Math.min(1,(lp+((u%N)+N)%N/N)/(end)))}
function tick(){
 const R=typeof RACE!=="undefined"?RACE:null;if(!R||!R.T||R.state==='done'||R.cfg&&R.cfg.freeroam||document.body.classList.contains('rprep')||!$('game')||getComputedStyle($('game')).display==='none'){el.classList.remove("on");document.body.classList.remove("dtm");return}
 const T=R.T,stage=!!(T.stage&&T.finI),humans=R.cars.filter(c=>c.human);if(!humans.length){el.classList.remove("on");document.body.classList.remove("dtm");return}
 const laps=stage?1:Math.max(1,R.cfg&&R.cfg.laps||R.laps||1),lenM=stage?(T.stage.len||T.finI*T.sp):(T.L||T.N*T.sp)*laps,end=stage?T.finI:1;
 let prs=[];
 for(const c of humans){const u=c.unw!=null?c.unw:c.idx;const p=c.fin?1:Math.max(0,Math.min(1,u/(stage?T.finI:T.N*laps)));prs.push({c,p})}
 const lead=prs.reduce((a,b)=>b.p>a.p?b:a,prs[0]);
 let n=0;
 const L=el.querySelector('.tr');
 prs.forEach((o,k)=>{const t=tg(n++,'up');t.style.setProperty('--c',PC[(o.c.pi!=null?o.c.pi:k)%4]);t.style.left=(o.p*100)+'%';t.firstChild.textContent=prs.length>1?'P'+(k+1):''});
 if(humans.length===1){/* the second triangle: the rival */
  let rv=null,rp=null;const h=humans[0],hp=prs[0].p;
  if(R.gh&&R.gh.length&&stage){const g=R.gh[R.gh.length-1],rec=g.d.rec,t=(R.state==='race'?R.t:0)+g.off;if(rec&&rec.length&&t>=rec[0][0]&&t<rec[rec.length-1][0]){let lo=0,hi=rec.length-1;while(lo<hi){const k=(lo+hi)>>1;if(rec[k][0]<t)lo=k+1;else hi=k}const id=rec[lo][12];rp=Math.max(0,Math.min(1,(id>R.T.N/2?0:id)/T.finI));rv='GHOST'}}
  else if(!stage){const ais=R.cars.filter(c=>!c.human);if(ais.length){let best=null;for(const a of ais){const d=a.unw-h.unw;if(!best||d>0&&(best.d<=0||d<best.d)||(best.d<=0&&d>best.d&&d<=0))best={a,d}}
    if(best){rp=Math.max(0,Math.min(1,best.a.unw/(T.N*laps)));rv='RIVAL'}}}
  if(rp==null&&R.state==='race'){rp=Math.max(0,Math.min(1,(R.t||0)*(stage?30:34)/lenM));rv='PACE'}
  if(rp!=null){const t=tg(n++,'dn');t.style.setProperty('--c','#ffffffcc');t.style.left=(rp*100)+'%';t.firstChild.textContent=''}
 }
 for(let k=n;k<tgs.length;k++)if(tgs[k])tgs[k].className='tg';
 for(let k=n;k<tgs.length;k++)if(tgs[k])tgs[k].style.display='none';
 for(let k=0;k<n;k++)tgs[k].style.display='';
 $('dtF').style.width=(lead.p*100)+'%';
 const left=Math.max(0,lenM*(1-lead.p));$('dtR').innerHTML=(left>=1000?(left/1000).toFixed(1):Math.round(left))+'<small>'+(left>=1000?'KM':'M')+' TO GO</small>';
 $('dtL').textContent=stage?'STAGE':'DISTANCE';
 const kk=Math.round(lenM/1000*10)/10;if(tkN!==lenM){tkN=lenM;L.querySelectorAll('.tk').forEach(x=>x.remove());const km=Math.floor(lenM/1000);for(let i=1;i<=km;i++){if(i*1000>=lenM-60)break;const d=document.createElement('div');d.className='tk';d.style.left=(i*1000/lenM*100)+'%';L.appendChild(d)}}
 el.classList.add("on");document.body.classList.add("dtm")}
setInterval(()=>{try{tick()}catch(e){if(!window.__dtE){window.__dtE=1;console.warn("distbar",e.message)}}},90);
})();
