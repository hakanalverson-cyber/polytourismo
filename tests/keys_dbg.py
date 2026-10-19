from shot import run,W
steps=[('wait',800),('js',"""(()=>{const T=sampleTrack(D[10]),N=T.N,o=[];for(const k in T){const v=T[k];let d=typeof v;if(v&&v.length!==undefined)d+='['+v.length+(v.length===N?'=N':'')+']';else if(v instanceof Map)d='Map'+v.size;else if(v&&typeof v==='object')d='obj '+Object.keys(v).slice(0,6);if(typeof v==='function')d='fn';o.push(k+':'+d)}return o.join(' ')})()""")]
run(W+'/Poly-Tourismo.html',steps,'sd')
