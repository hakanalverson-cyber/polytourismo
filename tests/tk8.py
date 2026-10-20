from shot import run,W
js="""(async()=>{PT8.launch({mode:'rally',circuit:true,track:14,laps:1,humans:[{id:'c35',alt:0,name:'T'}],ai:[],tod:'day',weather:'clear'});
await new Promise(r=>setTimeout(r,1800));document.getElementById('rlPlay').click();
const c=RACE.cars[0];const key=k=>window.dispatchEvent(new KeyboardEvent('keydown',{code:k,bubbles:true}));
down.add('KeyW');const log=[];let last=-1;
for(let i=0;i<60*40;i++){step(1/60);if(RACE.state!=='race')continue;const G=PT8.GT(c.cs);const lim=PT8.effTop(c.cs,c.rg)*1.03;if(c.sp>.9*lim&&c.rg<G.length-1){key('KeyE')}
 if(i%120==0)log.push(Math.round(c.sp*2.237)+'mph g'+(c.rg+1)+'/'+G.length+' cs'+c.gear)}
key('KeyQ');log.push('afterQ rg'+c.rg);hudUpdate();return log.join(' | ')})()"""
run(W+'/Poly-Tourismo.html',[('wait',800),('js',js),('shot','dash')],'tk8')
