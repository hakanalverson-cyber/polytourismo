from shot import run,W
st=[('wait',2500),('js',"""(()=>{const C=PT8.C10;const a=C.model(26,0),b=C.model(26,1);const f=m=>{let o=[];m.traverse(x=>{if(x.isMesh&&x.name=='paint')o.push(x.material.color.getHexString())});return o};return JSON.stringify([f(a),f(b),C.meta[26].paint,C.altRGB(26),PT8.BYID.c26.body,PT8.BYID.c26.alt,PT8.modelOf('c26',1)])})()""")]
run(W+'/Poly-Tourismo.html',st,'d')
