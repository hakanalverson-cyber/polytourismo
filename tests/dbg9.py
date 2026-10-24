from shot import run,W
setup="""(()=>{PT8.launch({mode:'ta',track:15,laps:1,humans:[{id:'merc',alt:0}],ai:[]});scr='game';paused=false;RACE.state='race';for(let i=0;i<100;i++)step(1/60);return 1})()"""
q="""(()=>{const d=RACE.scene.children.find(m=>m.geometry&&m.geometry.type==='SphereGeometry'&&m.geometry.parameters.radius>1000);const e=d.matrixWorld.elements;return JSON.stringify([e[12]|0,e[13]|0,e[14]|0,d.userData,RACE.scene.userData.skyRide,d.parent===RACE.scene,RACE.scene.children.indexOf(d),typeof PT8.skyTrack])})()"""
run(W+'/Poly-Tourismo.html',[('js',"(()=>{dispatchEvent(new KeyboardEvent('keydown',{key:'Enter'}));return 1})()"),('wait',1500),('js',setup),('wait',2500),('js',q)],'dbg9')
