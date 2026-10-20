from shot import run,W
run(W+'/Poly-Tourismo.html',[('wait',2500),('js',"D.map((d,i)=>i+':'+d.id+' '+d.name+' '+(d.tod0||'')+' '+(d.gravel?'G':'')+(d.city?'C':'')+(d.sea?'S':'')+(d.hard?'H':'')).join('; ')")],'mp')
