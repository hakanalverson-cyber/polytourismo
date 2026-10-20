from shot import run,W
js="""(()=>{const a=PT8.CARS.filter(c=>!c.rallyOnly&&!c.trackOnly).map(c=>PT8.pp(c)).sort((x,y)=>x-y);const th=[[580,700,830,950],[600,720,840,960],[620,740,850,980],[560,680,800,930]];return JSON.stringify(th.map(t=>{const n=[0,0,0,0,0];a.forEach(v=>n[v<t[0]?0:v<t[1]?1:v<t[2]?2:v<t[3]?3:4]++);return t.join('/')+' => '+n.join(',')}))+' n='+a.length})()"""
run(W+'/Poly-Tourismo.html',[('wait',2500),('js',js)],'cls2')
