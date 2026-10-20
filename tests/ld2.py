from shot import run,W
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',800),
('js',"(()=>{window.__n=0;const o=PT8.launchWithIntro;PT8.launchWithIntro=function(c){window.__n++;return o.apply(this,arguments)};PT8.ui.openCards();document.querySelector('.card[data-m=ta]').click();return 1})()"),('wait',900),
('js',"(()=>{document.getElementById('suGo').click();return 'called '+window.__n})()"),('wait',200),
('js',"(()=>{const e=document.getElementById('rlLoad');return 'called '+window.__n+' el '+(e?e.className+' '+getComputedStyle(e).opacity+' z'+getComputedStyle(e).zIndex:'none')+' scr '+scr})()"),('shot','l')]
run(W+'/Poly-Tourismo.html',st,'ld2')
