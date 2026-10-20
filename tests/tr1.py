from shot import run,W
L="PT8.launch({mode:'cutup',track:0,time:120,humans:[{id:'c40',alt:0,name:'T'}],ai:[],traffic:'light',tod:'day'})"
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();"+L+";return 1})()"),('wait',3000),('js',"(()=>{RACE.state='race';return 1})()"),('wait',500),
('js',"(()=>{const t=RACE.traffic[0],a=t.m.ptWheels?t.m.ptWheels[0].angle:null;for(let i=0;i<60;i++)step(1/60);const b=t.m.ptWheels?t.m.ptWheels[0].angle:null;return 'ptWheels '+!!t.m.ptWheels+' angle '+a+' -> '+b+' steer '+(t.m.ptWheels?t.m.ptWheels[0].pivot.rotation.y:'')})()")]
run(W+'/Poly-Tourismo.html',st,'tr1')
