from shot import run,W
js="""(()=>{const t0=performance.now();PT8.launch({mode:'ta',track:14,laps:2,humans:[{id:'c0',alt:0}],ai:[]});const t1=performance.now();PT8.launch({mode:'ta',track:0,laps:2,humans:[{id:'c0',alt:0}],ai:[]});const t2=performance.now();let n=0;RACE.scene.traverse(o=>{if(o.isMesh)n++});PT8.launch({mode:'ta',track:14,laps:2,humans:[{id:'c0',alt:0}],ai:[]});let m=0;RACE.scene.traverse(o=>{if(o.isMesh)m++});return Math.round(t1-t0)+'ms RA, '+Math.round(t2-t1)+'ms Quarry; meshes quarry '+n+' RA '+m})()"""
run(W+'/Poly-Tourismo.html',[('wait',800),('js',js)],'ra7')
