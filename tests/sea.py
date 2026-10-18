from shot import run,W
js="""(()=>{PT8.launch({mode:'mp',track:7,laps:2,humans:[{id:'merc',alt:0}],ai:[]});const T=RACE.T;const v=[];for(let x=-500;x<=500;x+=40)for(let z=-450;z<=450;z+=40)v.push(T.terr(x,z));v.sort((a,b)=>a-b);
 let lo=1e9,hi=-1e9;for(let i=0;i<T.N;i++){lo=Math.min(lo,T.y[i]);hi=Math.max(hi,T.y[i])}
 return {road:[lo,hi],terr:[v[0],v[Math.floor(v.length*.1)],v[Math.floor(v.length*.3)],v[Math.floor(v.length*.5)],v[v.length-1]],bounds:T.bounds}})()"""
run(W+'/Poly-Tourismo.html',[('js',js)],'sea')
