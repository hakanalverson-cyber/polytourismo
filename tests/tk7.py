import sys
from shot import run,W
ids=sys.argv[1].split(',')
steps=[('wait',800),('js',"""(()=>{D.push(Object.assign({},D[14],{ra:0,look:0,name:'TEST',pts:[[0,0,0],[0,1000,0],[0,2000,0],[0,3000,0],[120,3330,0],[420,3480,0],[720,3330,0],[840,3000,0],[840,2000,0],[840,1000,0],[840,0,0],[720,-330,0],[420,-480,0],[120,-330,0]],walls:[],ice:[],boost:[],jumps:[]}));return D.length})()""")]
for cid in ids:
    steps.append(('js',"""(async()=>{PT8.launch({mode:'rally',circuit:true,track:15,laps:1,humans:[{id:'%s',alt:0,name:'T'}],ai:[],tod:'day',weather:'clear'});
await new Promise(r=>setTimeout(r,1800));const b=document.getElementById('rlPlay');if(b)b.click();
PT8.aiPost=(c)=>{if(!c.human)return;const G=PT8.GT(c.cs);let g=c.gear|0;if(g<G.length-1&&c.sp>.96*PT8.effTop(c.cs,g)*(c.mt?c.mt.top:1))g++;else if(g>0&&c.sp<.6*PT8.effTop(c.cs,g-1))g--;c.gear=g};const c=RACE.cars[0];c.forceAI=true;c.ai={skill:.97,lat:0,name:'bot'};const prof=[];let mx=0,t200=null,t100=null,t60=null,d200=null,off=0;
for(let i=0;i<60*70;i++){step(1/60);if(RACE.state!=='race')continue;mx=Math.max(mx,c.sp);const m=c.sp*2.237;if(t60==null&&m>=60)t60=RACE.t;if(t100==null&&m>=100)t100=RACE.t;if(t200==null&&m>=200){t200=RACE.t;d200=c.unw*RACE.T.sp}if(!c.onRoad)off++;if(i%%120==0)prof.push(RACE.t.toFixed(0)+'s:'+Math.round(m)+'/g'+c.gear+'/tg'+Math.round(c._tg*2.237)+'/i'+c.idx)}
return '%s '+c.cs.name+' top '+Math.round(mx*2.237)+'mph  0-60 '+(t60&&t60.toFixed(1))+' 0-100 '+(t100&&t100.toFixed(1))+' 200@ '+(t200&&t200.toFixed(1))+'s '+(d200&&Math.round(d200))+'m off '+off+' '+prof.join(' ')})()"""%(cid,cid)))
run(W+'/Poly-Tourismo.html',steps,'tk7')
