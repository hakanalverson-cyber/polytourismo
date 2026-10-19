from shot import run,W
steps=[('wait',800),('js',"""(()=>{window.__l=[];const o=PT8.elevGraph;PT8.elevGraph=(T,w,h,a)=>{__l.push(T.d.id+':'+T.y[500].toFixed(1)+':'+T.N);return o(T,w,h,a)};PT8.ui.openCards();document.querySelector('[data-m=rally]').click();return 1})()"""),('wait',3000),
('js',"""(()=>{document.querySelectorAll('#trkList .trk')[2].click();return 1})()"""),('wait',4000),('js',"""(()=>__l.join(' | '))()""")]
run(W+'/Poly-Tourismo.html',steps,'td')
