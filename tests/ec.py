from shot import run,W
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',800),
('js',"JSON.stringify(PT8.CARS.filter(c=>/ZONDA|DIABLO|HURACAN|458|599|RS4|GT3|F1 GTR|787B|PROCAR|R8 LMS/.test(c.name)).map(c=>[c.name,c.cls,PT8.pp(c),c.price]))"),
('js',"(()=>{const s=PT8.SV();s.cr=100000;PT8.buy('c30',0);const a=PT8.tuneSet('c30',0,'aero',2),b=PT8.SV().cr;return JSON.stringify([a,b,PT8.tuneGet('c30',0),PT8.tuneBase('c30')])})()"),
('js',"(()=>{PT8.launch({mode:'ta',track:0,laps:1,humans:[{id:'merc',alt:0,name:'T'}],ai:[],tod:'day',endur:false});return 1})()"),('wait',3000),
('js',"(()=>{esc();return scr})()"),('wait',300),
('js',"(()=>{try{resume()}catch(e){return 'ERR '+e}return scr+' '+paused})()"),('wait',1300),('shot','cd1'),
('js',"(()=>document.getElementById('ptCD').textContent+' '+paused)()"),('wait',2500),
('js',"(()=>scr+' '+paused)()")]
run(W+'/Poly-Tourismo.html',st,'ec')
