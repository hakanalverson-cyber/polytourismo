from shot import run,W
chk="""(()=>{const out={};for(const tr of [10,11,12,13]){
 const T=sampleTrack(Object.assign({},D[tr],{id:D[tr].look}));let mn=1e9,at=null;const N=T.N;
 for(let i=0;i<N;i+=2)for(let j=i+1;j<N;j+=2){const a=Math.min(j-i,N-(j-i))*T.sp;if(a<60)continue;const q=Math.hypot(T.x[i]-T.x[j],T.z[i]-T.z[j]);if(q<mn){mn=q;at=[i,j]}}
 let ymn=1e9,ymx=-1e9;for(let i=0;i<N;i++){ymn=Math.min(ymn,T.y[i]);ymx=Math.max(ymx,T.y[i])}
 out[D[tr].name]={N,L:Math.round(T.L),minSep:+mn.toFixed(1),at,y:[+ymn.toFixed(1),+ymx.toFixed(1)],fords:T.fords.length,jumps:(T.jumps||[]).length}}
 return JSON.stringify(out,null,1)})()"""
def go(tr):
    return ('js',"""(()=>{PT8.launch({mode:'mp',track:%d,laps:2,humans:[{id:'merc',alt:0}],ai:[]});
 for(let i=0;i<60*6;i++)step(1/60);for(let i=0;i<3;i++)hudUpdate();const sc=FS;return JSON.stringify({props:sc.userData.propCount,err:sc.userData.propError,stage:sc.userData.stage})})()"""%tr)
steps=[('wait',800),('js',chk)]
for tr in [10,11,12,13]: steps+=[go(tr),('wait',500),('shot','s%d'%tr)]
run(W+'/Poly-Tourismo.html',steps,'stg')
