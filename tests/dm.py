from shot import run,W
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',800),
('js',"JSON.stringify(Object.keys(P8=PT8.BLD||{}).length)"),
('js',"(()=>{const o={};for(const k in PT8.BLD){const g=PT8.BLD[k];o[k]=[g.w,g.d,g.h].map(v=>Math.round(v*10)/10)}return JSON.stringify(o)})()")]
run(W+'/Poly-Tourismo.html',st,'dm')
