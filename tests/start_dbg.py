from shot import run,W
steps=[('wait',800),('js',"""(()=>{const o={};for(const i of PT8.STAGES){const T=sampleTrack(D[i]),K=PT8.kappa(T),N=T.N;
 const kmax=(c,r)=>{let m=0;for(let k=-r;k<=r;k++)m=Math.max(m,K[(c+k+N)%N]);return +(1/Math.max(m,1e-5)).toFixed(0)};
 const grade=(c,r)=>{let m=0;for(let k=-r;k<=r;k++){const a=(c+k+N)%N,b=(c+k+1+N)%N;m=Math.max(m,Math.abs(T.y[b]-T.y[a])/T.sp)}return +(m*100).toFixed(1)};
 // best straight windows
 let best=[];for(let c=0;c<N;c+=5){const r=Math.round(60/T.sp);best.push([kmax(c,r),grade(c,r),c])}
 const good=best.filter(b=>b[0]>400&&b[1]<3).length;
 o[i]={N,startR_100m:kmax(0,Math.round(100/T.sp)),startGrade:grade(0,Math.round(100/T.sp)),goodWindows:good+'/'+best.length,gate:PT8.cpsOf(T).map(c=>kmax(c,Math.round(55/T.sp))+'/'+grade(c,Math.round(55/T.sp)))}}
return JSON.stringify(o)})()""")]
run(W+'/Poly-Tourismo.html',steps,'sd')
