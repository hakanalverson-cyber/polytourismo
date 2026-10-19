from shot import run,W
steps=[('wait',800),('js',"""(()=>{const o={};for(const id of PT8.STAGES){const T=sampleTrack(D[id]);const sc=buildWorld(T);o[id]=T.solids.length}return JSON.stringify(o,null,1)})()""")]
run(W+'/Poly-Tourismo.html',steps,'sd')
