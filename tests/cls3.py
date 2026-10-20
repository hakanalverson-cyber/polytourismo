from shot import run,W
js="""(()=>{const g={};PT8.CARS.filter(c=>!c.rallyOnly&&!c.trackOnly).forEach(c=>{(g[c.cls]=g[c.cls]||[]).push(PT8.pp(c))});const o={};for(const k in g){const a=g[k].sort((x,y)=>x-y);o[k]=[a[0],a[a.length-1],a.length]}
const ev=(PT8.EVENTS||[]).map(e=>e.id+':'+(e.cap||'-')+':'+(PT8.eventLocked(e)||'ok')).join(' ');
const ok=PT8.eligibleCars(null).map(c=>c.id+c.cls).join(',');const rc=['ford','lr','urus','ster','gtr'].map(i=>i+PT8.BYID[i].cls).join(' ');
const per=(PT8.EVENTS||[]).slice(0,40).map(e=>{try{return e.cap}catch(x){return '?'}});
return JSON.stringify({o,evN:(PT8.EVENTS||[]).length,caps:[...new Set(per)],owned:ok,rally:rc,c51:PT8.BYID.c51.cls,c120:PT8.BYID.c120.cls,loaner:PT8.loanerFor('C',false).id+PT8.loanerFor('C',false).cls})})()"""
run(W+'/Poly-Tourismo.html',[('wait',2500),('js',js)],'cls3')
