from shot import run,W
js="""(()=>{const t0=performance.now();let n=0;const out=[];for(const c of PT8.CARS.slice(0,12)){const idx=PT8.modelOf(c.id,0);const t=performance.now();const ph=window.PT7.photos[idx]||window.PT7.makePhotos(idx);out.push(Math.round(performance.now()-t)+(ph?'/'+ph.length+(ph[0]?ph[0].width+'x'+ph[0].height:''):'/null'))}return out.join(' ')+' total '+Math.round(performance.now()-t0)})()"""
run(W+'/Poly-Tourismo.html',[('wait',3000),('js',js)],'ph1')
