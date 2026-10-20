from shot import run,W
js="""(()=>{const sv=PT8.SV();PT8.CARS.forEach(c=>sv.owned[c.id]=1);PT8.ui.openShow('garage',{player:0,ret:'menu'});const o={};document.querySelectorAll('.gh').forEach(h=>{const g=h.nextElementSibling;o[h.dataset.sec]=[...g.querySelectorAll('.gc')].slice(0,6).map(e=>PT8.pp(PT8.BYID[e.dataset.id]))});return JSON.stringify(o)})()"""
run(W+'/Poly-Tourismo.html',[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',1000),('js',js)],'ord1')
