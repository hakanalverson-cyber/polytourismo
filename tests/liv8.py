from shot import run,W
js="""(()=>{const out={};for(const p of PT8.LV.PATS.keys()){const cv=document.createElement('canvas');cv.width=cv.height=512;const L={p,a:'#12285e',b:'#f1f3f5',c:'#2cc7f0',f:0,w:0,n:42,s:3};const t=performance.now();PT8.LV.drawLivery(cv,L);out[p]=Math.round(performance.now()-t)}return JSON.stringify(out)})()"""
steps=[('wait',1500),('js',js),('js',"(()=>{PT8.livSet('merc',0,{p:12,a:'#1f5fe0',b:'#8a4bdc',c:'#2cc7f0',f:0,w:1,n:0,s:5});return 1})()"),
('js',"(()=>{const u=PT8.ui;u.renderSetup&&u.renderSetup();return 1})()"),('js',"(()=>{show('s8setup');return 1})()"),('wait',700),('shot','setup')]
run(W+'/Poly-Tourismo.html',steps,'liv8')
