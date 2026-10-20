from shot import run,W
js="""(async()=>{PT8.launch({mode:'rally',circuit:true,track:14,laps:1,humans:[{id:'p1',alt:0,name:'T'}],ai:[],tod:'day',weather:'clear'});
await new Promise(r=>setTimeout(r,1800));const b=document.getElementById('rlPlay');if(b)b.click();
const c=RACE.cars[0];c.forceAI=true;c.ai={skill:.97,lat:0,name:'bot'};const o=[];
for(let i=0;i<60*45;i++){step(1/60);if(i%90==0&&RACE.state==='race')o.push((RACE.t).toFixed(1)+'s '+Math.round(c.sp*2.237)+'mph g'+c.gear+' th'+(c.in.th)+' br'+c.in.br+' idx'+c.idx+' tg'+Math.round(c._tg*2.237)+' tn'+Math.round(c._tn*2.237))}return o.join('\\n')})()"""
run(W+'/Poly-Tourismo.html',[('wait',800),('js',js)],'tk6')
