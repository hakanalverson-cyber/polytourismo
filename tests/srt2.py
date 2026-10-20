from shot import run,W
st=[('wait',3000),('js',"(()=>{const f=ids=>PT8.SORTED.filter(c=>ids.includes(c.id)).map(c=>c.cls+':'+Math.round(PT8.pp(c))+(c.rallyOnly?'r':c.trackOnly?'t':'')).join(' ');return 'RALLY '+f(PT8.RALLY_CARS)+'\\nTRACK '+f(PT8.TRACK_CARS)})()")]
run(W+'/Poly-Tourismo.html',st,'srt2')
