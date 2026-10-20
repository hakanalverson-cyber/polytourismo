from shot import run,W
js="""(()=>{const o=PT8.CARS.filter(c=>c.mph).map(c=>[c.id,c.mph,Math.round(PT8.effTop(c,PT8.GT(c).length-1)*2.23694)]).filter(a=>Math.abs(a[1]-a[2])>3);return 'mismatch '+JSON.stringify(o)+' km '+JSON.stringify(KM[1])+' '+JSON.stringify(PT8.SHIFTK.map(k=>k.n))})()"""
st=[('wait',800),('js',js),('js',"(()=>{PT8.setP2Keys('numpad');return JSON.stringify(KM[1])+PT8.SHIFTK[1].dn+PT8.SHIFTK[1].up})()"),
('js',"(()=>{PT8.launch({mode:'mp',track:0,laps:1,humans:[{id:'merc'},{id:'c2'}],ai:[],tod:'day'});return String(PT8.noHb())})()"),
('js',"(()=>{down.add('Numpad9');window.dispatchEvent(new KeyboardEvent('keydown',{code:'Numpad9'}));for(let i=0;i<60*6;i++)step(1/60);const c=RACE.cars[1];window.dispatchEvent(new KeyboardEvent('keydown',{code:'Numpad9'}));for(let i=0;i<10;i++)step(1/60);return 'p2 gear '+c.gear+' state '+RACE.state})()")]
run(W+'/Poly-Tourismo.html',st,'rs1')
