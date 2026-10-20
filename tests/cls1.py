from shot import run,W
js="""(()=>{const g={};PT8.CARS.filter(c=>!c.rallyOnly&&!c.trackOnly).forEach(c=>{(g[c.cls]=g[c.cls]||[]).push(PT8.pp(c))});const o={};for(const k in g){const a=g[k].sort((x,y)=>x-y);o[k]=[a[0],a[a.length-1],a.length]}
const bad=PT8.CARS.filter(c=>!c.rallyOnly&&!c.trackOnly&&PT8.pp(c)>=680&&PT8.pp(c)<=760).map(c=>c.id+':'+c.cls+':'+PT8.pp(c)).slice(0,14);
return JSON.stringify({o,bad,fn:String(PT8.pp).slice(0,300)})})()"""
run(W+'/Poly-Tourismo.html',[('wait',2500),('js',js)],'cls1')
