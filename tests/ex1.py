from shot import run,W
L="PT8.launch({mode:'ta',track:0,laps:4,humans:[{id:'c40',alt:0,name:'T'}],ai:[],tod:'day',dmg:true})"
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();"+L+";return 1})()"),('wait',3000),('js',"(()=>{RACE.state='race';return 1})()"),('wait',800),
('js',"(()=>{const c=RACE.cars.find(x=>x.human);for(let i=0;i<120;i++)step(1/60);const u0=c.unw,x0=c.x,z0=c.z;PT8.hurt(RACE,c,26,1,0);PT8.hurt(RACE,c,26,1,0);const a='dmg '+c.dmg+' exp '+c.exp+' warn['+c.warn+'] fuel '+!!document.querySelector('.fuel,.pit');let t=0;while(c.exp>0&&t<400){step(1/60);t++}return a+' ticks '+t+' unw0 '+u0.toFixed(1)+' unw1 '+c.unw.toFixed(1)+' dmgAfter '+c.dmg+' dx '+Math.hypot(c.x-x0,c.z-z0).toFixed(1)+' cfg.endur '+RACE.cfg.endur})()"),('wait',500),('shot','ex')]
run(W+'/Poly-Tourismo.html',st,'ex1')
