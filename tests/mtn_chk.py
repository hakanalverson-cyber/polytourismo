from shot import run,W
steps=[('wait',800),('js',"""(()=>{const o={};for(const id of PT8.STAGES){const d=Object.assign({},D[id]);if(d.look!=null)d.id=d.look;const T=sampleTrack(D[id]);const sc=buildWorld(T);let worst=1e9,n=0;
sc.traverse(m=>{if(m.isMesh&&m.geometry&&m.geometry.type==='ConeGeometry'&&m.geometry.parameters.radius>=80&&m.geometry.parameters.height>=60){n++;let b=1e9;for(let i=0;i<T.N;i+=3){const q=Math.hypot(m.position.x-T.x[i],m.position.z-T.z[i]);if(q<b)b=q}worst=Math.min(worst,b-m.geometry.parameters.radius)}});
let mx=0,sd=0;for(let i=0;i<T.N;i++){const g=Math.abs(T.y[(i+1)%T.N]-T.y[i])/T.sp;mx=Math.max(mx,g)}
let y0=1e9,y1=-1e9;for(let i=0;i<T.N;i++){y0=Math.min(y0,T.y[i]);y1=Math.max(y1,T.y[i])}
o[id]={cones:n,clear:+worst.toFixed(0),maxgrade:+(mx*100).toFixed(0),range:+(y1-y0).toFixed(0)}}return JSON.stringify(o)})()""")]
run(W+'/Poly-Tourismo.html',steps,'mc')
