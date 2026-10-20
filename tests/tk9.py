from shot import run,W
js="""(async()=>{PT8.launch({mode:'rally',circuit:true,track:14,laps:1,humans:[{id:'c35',alt:0,name:'T'}],ai:[],tod:'day',weather:'clear'});
await new Promise(r=>setTimeout(r,1800));document.getElementById('rlPlay').click();
const c=RACE.cars[0];const key=k=>window.dispatchEvent(new KeyboardEvent('keydown',{code:k,bubbles:true}));
down.add('KeyW');for(let i=0;i<60*8;i++)step(1/60);
const o=[];o.push('scr='+scr+' paused='+paused+' state='+RACE.state+' prep='+RACE.prep+' sp='+Math.round(c.sp*2.237)+' rg='+c.rg+' lim='+Math.round(PT8.effTop(c.cs,0)*2.237));
key('KeyE');o.push('afterE rg='+c.rg+' gear='+c.gear);key('KeyE');key('KeyE');o.push('rg='+c.rg);key('KeyQ');o.push('afterQ rg='+c.rg);
return o.join(' | ')})()"""
run(W+'/Poly-Tourismo.html',[('wait',800),('js',js)],'tk9')
