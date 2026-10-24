from shot import run,W
js=lambda m:"(()=>{const u=PT8.ui;u.ST.mode='%s';u.ST.track=0;u.renderSetup();show('s8setup');return [...document.querySelectorAll('#trkList .trk b')].map(e=>e.textContent).join(', ')})()"%m
run(W+'/Poly-Tourismo.html',[('js',"(()=>{dispatchEvent(new KeyboardEvent('keydown',{key:'Enter'}));return 1})()"),('wait',2500)]+[('js',js(m)) for m in ('ta','mp','elim','cutup','track','rally')]+[('wait',800),('shot','a')],'pk1')
