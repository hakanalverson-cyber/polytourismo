from shot import run,W
st=[('wait',3000),('js',"(()=>Object.keys(PT8.BLD).map(k=>{const g=PT8.BLD[k].g;g.computeBoundingBox();const b=g.boundingBox;return k+' '+(b.max.x-b.min.x).toFixed(1)+'x'+(b.max.y-b.min.y).toFixed(1)+'x'+(b.max.z-b.min.z).toFixed(1)}).join('\\n'))()")]
run(W+'/Poly-Tourismo.html',st,'bk')
