from shot import run,W
js="""(()=>{const o={};for(const tr of [3,7,8]){PT8.launch({mode:'ta',track:tr,laps:1,humans:[{id:'merc',alt:0}],ai:[]});for(let i=0;i<30;i++)step(1/60);R.info.reset();R.render(RACE.scene,RACE.cam||new THREE.PerspectiveCamera(60,1.7,.3,1800));let objs=0,inst=0;RACE.scene.traverse(q=>{if(q.isMesh)objs++;if(q.isInstancedMesh)inst+=q.count});o[tr]={calls:R.info.render.calls,tris:R.info.render.triangles,meshes:objs,instances:inst}}return JSON.stringify(o)})()"""
run(W+'/Poly-Tourismo.html',[('js',js)],'p8')
