from shot import run,W
js="""(()=>{PT8.launch({mode:'mp',track:4,laps:2,humans:[{id:'merc',alt:0}],ai:[]});for(let i=0;i<60*6;i++)step(1/60);for(let i=0;i<3;i++)hudUpdate();return 1})()"""
js2="""(()=>{PT8.launch({mode:'mp',track:10,laps:2,humans:[{id:'merc',alt:0}],ai:[]});for(let i=0;i<60*6;i++)step(1/60);const sc=FS;let m=null;sc.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh&&o.geometry.attributes.color&&o.geometry.attributes.position.count>20000)m=o});const c=m.geometry.attributes.color.array;return JSON.stringify([c[3000],c[3001],c[3002],c.length,m.material.type,m.material.vertexColors,sc.fog&&sc.fog.color.getHexString()])})()"""
run(W+'/Poly-Tourismo.html',[('wait',800),('js',js),('wait',400),('shot','a'),('js',js2),('wait',400),('shot','b')],'dbg')
