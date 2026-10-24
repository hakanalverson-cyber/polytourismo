from shot import run,W
steps=[('wait',9000),('js',"(()=>{const P=PT8;return '@@'+JSON.stringify(P.CARS.map(c=>{const s=c._std||c;return [c.id,c.name,c.cls,Math.round(c.topG||s.top),+s.acc.toFixed(1),+s.grip.toFixed(2),+s.brk.toFixed(2),P.pp(c)]}))+'@@'})()")]
run(W+'/Poly-Tourismo.html',steps,'cls')
