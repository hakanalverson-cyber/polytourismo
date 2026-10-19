from shot import run,W
st=[('wait',800),('js',"""(()=>{PT8.stageRender=()=>new Promise(r=>setTimeout(r,60000));PT8.rallyIntro(()=>{},0);return 1})()"""),('wait',600)]
for i,t in enumerate([.75,1.0,1.2,1.4,1.6,1.8]):
    st+= [('js',f"PT8._jumpAt({t})"),('shot',f'f{i}')]
run(W+'/Poly-Tourismo.html',st,'j')
