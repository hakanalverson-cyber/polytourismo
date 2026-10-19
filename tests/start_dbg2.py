from shot import run,W
steps=[('wait',800),('js',"""(()=>{const o={};for(const i of PT8.STAGES){const T=sampleTrack(D[i]),K=PT8.kappa(T),N=T.N;
 const rad=(c,r)=>{let m=0;for(let k=-r;k<=r;k++)m=Math.max(m,K[(c+k+N)%N]);return 1/Math.max(m,1e-5)};
 const gr=(c,r)=>{let m=0;for(let k=-r;k<=r;k++){const a=(c+k+N)%N,b=(c+k+1+N)%N;m=Math.max(m,Math.abs(T.y[b]-T.y[a])/T.sp)}return m*100};
 const res={};for(const [R,r] of [[90,45],[130,45],[200,45],[130,70]]){let n=0,bw=[];for(let c=0;c<N;c++){const rr=Math.round(r/T.sp);if(rad(c,rr)>R&&gr(c,rr)<2.5){n++;}}res[R+'/'+r]=n}
 o[i]=res}
return JSON.stringify(o)})()""")]
run(W+'/Poly-Tourismo.html',steps,'sd')
