from shot import run,W
st=[('wait',3000),('js',"(()=>PT8.SORTED.filter(c=>!c.rallyOnly&&!c.trackOnly).map(c=>c.cls+':'+Math.round(PT8.pp(c))).join(' '))()")]
run(W+'/Poly-Tourismo.html',st,'srt')
