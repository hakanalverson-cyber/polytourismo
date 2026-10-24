from shot import run,W
setup="""(()=>{PT8.launch({mode:'ta',track:15,laps:1,humans:[{id:'merc',alt:0}],ai:[]});scr='game';paused=false;RACE.state='race';for(let i=0;i<100;i++)step(1/60);document.querySelectorAll('.title,#title,.ttl,#ptTitle').forEach(e=>e.style.display='none');return 1})()"""
def hide(tag,expr):
    return [('js',"(()=>{RACE.scene.children.forEach(m=>{m.visible=true});RACE.scene.children.forEach(m=>{if(%s)m.visible=false});return 1})()"%expr),('wait',1200),('shot',tag)]
steps=[('js',"(()=>{dispatchEvent(new KeyboardEvent('keydown',{key:'Enter'}));return 1})()"),('wait',1500),('js',setup),('wait',2000)]
steps+=hide('cones',"m.geometry&&m.geometry.type==='ConeGeometry'")
steps+=hide('dome',"m.geometry&&m.geometry.type==='SphereGeometry'&&m.geometry.parameters.radius>1000")
steps+=hide('cyl',"m.geometry&&m.geometry.type==='CylinderGeometry'&&m.geometry.parameters.radiusTop>1000")
run(W+'/Poly-Tourismo.html',steps,'dbg8')
