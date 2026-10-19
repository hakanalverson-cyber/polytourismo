from shot import run,W
run(W+'/Poly-Tourismo.html',[('wait',2000),('js',"JSON.stringify(D.map((d,i)=>[i,d.name,Math.round(sampleTrack(d).L),d.hw,d.look]))")],'len10')
