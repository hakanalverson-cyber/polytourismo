from shot import run,W
js="""(()=>{const o=[];for(const tr of [14,15]){PT8.launch({mode:'mp',rally:true,circuit:true,track:tr,laps:2,humans:[{id:'merc',alt:0}],ai:[]});const T=RACE.T;let zmin=1e9,zmax=-1e9,xmin=1e9,xmax=-1e9,ymin=1e9,ymax=-1e9,hw=0;for(let i=0;i<T.N;i++){zmin=Math.min(zmin,T.z[i]);zmax=Math.max(zmax,T.z[i]);xmin=Math.min(xmin,T.x[i]);xmax=Math.max(xmax,T.x[i]);ymin=Math.min(ymin,T.y[i]);ymax=Math.max(ymax,T.y[i]);hw+=T.hw[i]}
 o.push({tr,name:T.d.name,L:Math.round(T.L),N:T.N,sp:T.sp,dx:Math.round(xmax-xmin),dz:Math.round(zmax-zmin),dy:+(ymax-ymin).toFixed(1),hw:+(hw/T.N).toFixed(1)});PT8.cleanupRace&&PT8.cleanupRace()}return JSON.stringify(o)})()"""
run(W+'/Poly-Tourismo.html',[('js',js)],'len2')
