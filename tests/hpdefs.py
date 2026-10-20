from shot import run,W
run(W+'/Poly-Tourismo.html',[('wait',4000),('js','''(()=>{const H=PT8.HP;if(!H||!H.ready)return 'notready';const o={};for(const n in H.defs){const d=H.defs[n];o[n]=[+d.w.toFixed(2),+d.h.toFixed(2),+d.d.toFixed(2),+d.min.y.toFixed(2),+(d.min.x+d.max.x).toFixed(2),+(d.min.z+d.max.z).toFixed(2)]}return JSON.stringify(o)})()''')],'hp')
