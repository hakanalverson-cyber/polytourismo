from shot import run,W
js="""(()=>{const res={};for(const tr of [7,8,9]){
 const T=sampleTrack(Object.assign({},D[tr],{id:D[tr].look!=null?D[tr].look:D[tr].id}));const N=T.N;let md=1e9,pair=null;
 for(let i=0;i<N;i+=2)for(let j=i+1;j<N;j+=2){const dd=Math.min(j-i,N-(j-i));if(dd<N*.08)continue;const d=Math.hypot(T.x[i]-T.x[j],T.z[i]-T.z[j])-(T.hw[i]+T.hw[j]);if(d<md){md=d;pair=[i,j]}}
 const K=PT8.kappa(T);let mk=0;for(let i=0;i<N;i++)mk=Math.max(mk,K[i]);
 res[tr]={L:Math.round(T.L),N,clear:+md.toFixed(1),pair,minR:+(1/mk).toFixed(1),jumps:(T.jumps||[]).length}}
 return res})()"""
run(W+'/Poly-Tourismo.html',[('js',js)],'nt')
