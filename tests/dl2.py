from shot import run,W
run(W+'/Poly-Tourismo.html',[('js',"JSON.stringify(D.map((d,i)=>[i,d.name,d.gravel?1:0,d.rally?1:0,PT8.STAGES.includes(i)?'S':'',(PT8.TRK_TRACKS||[]).includes(i)?'T':'']))")],'dl2')
