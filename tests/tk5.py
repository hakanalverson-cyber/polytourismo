import sys
from shot import run,W
ids=sys.argv[1].split(',') if len(sys.argv)>1 else ['p1']
steps=[('wait',800)]
for cid in ids:
    js="""(async()=>{PT8.launch({mode:'rally',circuit:true,track:14,laps:1,humans:[{id:'%s',alt:0,name:'T'}],ai:[],tod:'day',weather:'clear'});
await new Promise(r=>setTimeout(r,1800));const b=document.getElementById('rlPlay');if(b)b.click();
RACE.T.kz.fill(1e-6);const c=RACE.cars[0];c.forceAI=true;c.ai={skill:.97,lat:0,name:'bot'};let mx=0,off=0,rs=0,wr=0,t0=0;
const gs={};
for(let i=0;i<60*140&&!c.fin;i++){step(1/60);mx=Math.max(mx,c.sp);if(RACE.state==='race'&&!c.onRoad)off++;if(c.respT>0&&!wr)rs++;wr=c.respT>0?1:0;gs[c.gear]=(gs[c.gear]||0)+1}
return '%s '+c.cs.name+' top '+Math.round(mx*2.237)+'mph fin='+c.fin+' t='+(c.finT||RACE.t).toFixed(1)+' off '+off+' resp '+rs+' dmg '+(c.dmg||0).toFixed(2)+' gears '+JSON.stringify(gs)+' ng '+PT8.GT(c.cs).length})()"""%(cid,cid)
    steps.append(('js',js))
run(W+'/Poly-Tourismo.html',steps,'tk5')
