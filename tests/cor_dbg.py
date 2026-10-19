from shot import run,W
steps=[('wait',800),('js',"""(()=>{const T=sampleTrack(D[10]);const K=PT8.kappa(T);let big=0,n=0;for(let i=0;i<T.N;i++){if(K[i]>1/95)n++}
return 'N '+T.N+' sp '+T.sp+' K>1/95: '+n+' maxK '+Math.max(...K).toFixed(4)+' K[0..5] '+Array.from(K.slice(0,5)).map(x=>x.toFixed(4))})()""")]
run(W+'/Poly-Tourismo.html',steps,'cd')
