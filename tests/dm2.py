from shot import run,W
L="PT8.launch({mode:'ta',track:0,laps:1,humans:[{id:'c40',alt:0,name:'T'}],ai:[],tod:'day',endur:false})"
sim="(()=>{const c=RACE.cars.find(x=>x.human);let g=[];for(let i=0;i<1500;i++){step(1/60);if(i%250==0)g.push(c.gear+'@'+Math.round(c.sp*2.237))}return g.join(' ')})()"
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();PT8.setTX(0,false);"+L+";return 1})()"),('wait',3000),('js',"(()=>{RACE.state='race';return 1})()"),('wait',800),
('down','KeyW'),('wait',300),('js',sim),('up','KeyW'),
('js',"(()=>{PT8.setTX(0,true);return 1})()"),
('js',"(()=>{PT8.launch({mode:'ta',track:0,laps:1,humans:[{id:'c40',alt:0,name:'T'}],ai:[],tod:'day',endur:false});return 1})()"),('wait',3000),('js',"(()=>{RACE.state='race';return 1})()"),('wait',800),
('down','KeyW'),('wait',300),('js',sim),('up','KeyW')]
run(W+'/Poly-Tourismo.html',st,'dm2')
