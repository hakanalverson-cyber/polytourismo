from shot import run,W
js="""(()=>{PT8.launch({mode:'ta',track:14,laps:3,humans:[{id:'c0',alt:0}],ai:[]});const T=RACE.T,R=PT8.RA,out=[];
for(const m of ['T1','T3','E2','T5','T6','T7','T10a','T12']){const p=R.pts[R.marks[m]];let b=1e18,k=0;for(let i=0;i<T.N;i++){const d=(T.x[i]-p[0])**2+(T.z[i]-p[1])**2;if(d<b){b=d;k=i}}
const row=[];for(const l of [-20,-12,-8,8,12,20]){const x=T.x[k]+Math.cos(T.psi[k])*l,z=T.z[k]-Math.sin(T.psi[k])*l;row.push(Math.round(T.terr(x,z)-T.y[k]))}out.push(m+' roadY '+Math.round(T.y[k])+' '+row.join(','))}return out.join(' | ')})()"""
run(W+'/Poly-Tourismo.html',[('wait',800),('js',js)],'ra4')
