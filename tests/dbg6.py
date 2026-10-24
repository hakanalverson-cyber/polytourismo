from shot import run,W
js="""(()=>{PT8.launch({mode:'ta',track:15,laps:1,humans:[{id:'merc',alt:0}],ai:[]});scr='game';paused=false;RACE.state='race';for(let i=0;i<100;i++)step(1/60);
 const sc=RACE.scene,o=[];sc.children.forEach(m=>{if(m.isMesh||m.isGroup){const b=new THREE.Box3().setFromObject(m),s=b.getSize(new THREE.Vector3());if(s.x>400||s.y>60)o.push((m.name||m.type)+' '+[b.min.x|0,b.min.y|0,b.min.z|0,b.max.x|0,b.max.y|0,b.max.z|0]+' mat '+(m.material&&m.material.type+':'+(m.material.color?m.material.color.getHexString():'')))}});return o.join(' | ')+' CHILDREN '+sc.children.length})()"""
run(W+'/Poly-Tourismo.html',[('js',"(()=>{dispatchEvent(new KeyboardEvent('keydown',{key:'Enter'}));return 1})()"),('wait',1500),('js',js)],'dbg6')
