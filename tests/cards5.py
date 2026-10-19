from shot import run,W
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',1200),('js',"(()=>{const s=document.querySelector('.card.big .sub'),cs=getComputedStyle(s);return [cs.opacity,cs.maxHeight,cs.display,cs.visibility,cs.color,s.getBoundingClientRect().height,s.textContent].join(' | ')})()")]
run(W+'/Poly-Tourismo.html',st,'cards5')
