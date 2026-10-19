from shot import run,W
js="""(()=>{const out=[];for(const k of [0,5,26,50,72,100,117,133,20,66]){
PT8.launch({mode:'ta',track:0,laps:2,humans:[{id:'c'+k,alt:0}],ai:[]});const c=RACE.cars[0];for(let i=0;i<30;i++)step(1/60);
const m=c.m;if(!m.ptWheels){out.push(k+':none');continue}
out.push(k+':'+m.ptWheels.map(w=>{let sxx=0,szz=0,sxz=0;w.spin.children.forEach(q=>{const p=q.geometry.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);sxx+=x*x;szz+=z*z;sxz+=x*z}});
const ay=.5*Math.atan2(2*sxz,sxx-szz)+Math.PI/2;const yaw=((ay+Math.PI/2)%Math.PI+Math.PI)%Math.PI-Math.PI/2;return (yaw*57.3).toFixed(1)}).join(','))}
return out.join(' | ')})()"""
run(W+'/Poly-Tourismo.html',[('wait',2500),('js',js)],'ro10')
