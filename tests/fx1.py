from shot import run,W
L="PT8.launch({mode:'ta',track:0,laps:2,humans:[{id:'c40',alt:0,name:'T'}],ai:[],tod:'day',dmg:true})"
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();"+L+";return 1})()"),('wait',3000),('js',"(()=>{RACE.state='race';return 1})()"),('wait',500),
('js',"(()=>{const c=RACE.cars.find(x=>x.human);c.vx=0;c.vz=10;c.sp=10;for(let i=0;i<30;i++)step(1/60);const s=Math.sin(c.yaw),co=Math.cos(c.yaw);PT8.hitFx(RACE,c,16,c.x+s*1.5,c.y+.5,c.z+co*1.5,-s,-co);for(let i=0;i<8;i++)step(1/60);return 'deb '+RACE.v7.deb.length})()"),('shot','fx')]
run(W+'/Poly-Tourismo.html',st,'fx1')
