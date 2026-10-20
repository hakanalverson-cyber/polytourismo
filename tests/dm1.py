from shot import run,W
L="PT8.launch({mode:'ta',track:0,laps:1,humans:[{id:'c40',alt:0,name:'T'}],ai:[],tod:'day',endur:false,dmg:true})"
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();PT8.setTX(0,false);"+L+";return 1})()"),('wait',3000),('js',"(()=>{RACE.state='race';return 1})()"),('wait',1500),
('js',"(()=>{const c=RACE.cars.find(x=>x.human);return 'gears '+PT8.GT(c.cs).length+' auto '+PT8.isAuto(c)+' state '+RACE.state})()"),
('down','KeyW'),('wait',9000),
('js',"(()=>{const c=RACE.cars.find(x=>x.human);return 'MANUAL after 7s: gear '+c.gear+' sp '+Math.round(c.sp*2.237)})()"),
('up','KeyW'),
('js',"(()=>{PT8.setTX(0,true);const c=RACE.cars.find(x=>x.human);c.seenU=undefined;return 'auto '+PT8.isAuto(c)})()"),
('down','KeyW'),('wait',9000),
('js',"(()=>{const c=RACE.cars.find(x=>x.human);return 'AUTO after 7s: gear '+c.gear+' sp '+Math.round(c.sp*2.237)})()"),
('up','KeyW'),
('js',"(()=>{const c=RACE.cars.find(x=>x.human);const m0=JSON.stringify(PT8.mul(c));PT8.hurt(RACE,c,14,1,0);return 'dmg '+c.dmg+' mulBefore '+m0+' after '+JSON.stringify(PT8.mul(c))+' plate '+(document.getElementById('rlStat')?document.getElementById('rlStat').style.display:'none')})()"),
('wait',1500),('shot','dmg')]
run(W+'/Poly-Tourismo.html',st,'dm1')
