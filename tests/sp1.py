from shot import run,W
st=[('wait',2500),('js',"(()=>{const m=PT8.CARS.filter(c=>c.mph&&!c.rallyOnly&&!c.trackOnly).map(c=>c.mph);return 'regular max '+Math.max(...m)+' min '+Math.min(...m)+' n'+m.length})()"),
('js',"(()=>{PT8.setReal(true);const m=PT8.CARS.filter(c=>c.mph&&!c.rallyOnly&&!c.trackOnly).map(c=>c.mph);const r=Math.max(...m);PT8.setReal(false);return 'real max '+r})()"),
('js',"JSON.stringify(['c26','c91','c98','c75','merc','c29'].map(i=>[i,PT8.BYID[i].real,PT8.BYID[i].mph]))")]
run(W+'/Poly-Tourismo.html',st,'sp1')
