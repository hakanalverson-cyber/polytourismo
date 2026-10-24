import sys
from shot import run,W
trk=sys.argv[1]
js=r"""(async()=>{PT8.dmgOn=()=>false;PT8.launch({mode:'ta',track:%s,laps:2,humans:[{id:'merc',alt:0}],ai:[{id:'merc',alt:0},{id:'merc',alt:0},{id:'merc',alt:0}]});scr='game';paused=false;
 const r0=R.render.bind(R);let rt=0,rn=0;R.render=function(s,c){const t=performance.now();const o=r0(s,c);rt+=performance.now()-t;rn++;return o};
 const st0=step;let stt=0,stn=0;step=function(dt){const t=performance.now();const o=st0.apply(this,arguments);stt+=performance.now()-t;stn++;return o};
 await new Promise(r=>setTimeout(r,9000));
 const fr=[];let last=performance.now();await new Promise(res=>{let n=0;(function f(){const t=performance.now();fr.push(t-last);last=t;if(++n<90)requestAnimationFrame(f);else res()})()});
 fr.sort((a,b)=>a-b);
 return ['render avg ms '+(rt/Math.max(1,rn)).toFixed(2)+' n='+rn,'step avg ms '+(stt/Math.max(1,stn)).toFixed(2)+' n='+stn,'frame median '+fr[45].toFixed(1)+' p90 '+fr[80].toFixed(1)+' canvas '+R.domElement.width+'x'+R.domElement.height+' dpr '+devicePixelRatio,'shadows '+R.shadowMap.enabled+' PTO '+JSON.stringify(window.PTO||{}).slice(0,300)].join('@@')})()""" % trk
run(W+'/Poly-Tourismo.html',[('js',js)],'cpu')
