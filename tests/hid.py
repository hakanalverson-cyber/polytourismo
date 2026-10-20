from shot import run,W
run(W+'/Poly-Tourismo.html',[('wait',2500),('js',"(()=>PT8.ui.ST&&Object.keys(window).length?JSON.stringify(PT8.TRACKS?PT8.TRACKS.map((d,i)=>i+d.name):'x'):0)()")],'h')
