from shot import run,W
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()")]
for t in [0,3,4,7,14]:
    st+=[('wait',500),('js',"(()=>{PT8.launch({mode:'ta',track:%d,laps:1,humans:[{id:'merc',alt:0,name:'T'}],ai:[],tod:'day',endur:false});return 1})()"%t),('wait',6000),('js',"(()=>{for(let i=0;i<30;i++)step(1/60);R.render(RACE.scene,RACE.cars[0].cam||RACE.cam||new THREE.PerspectiveCamera());return RACE.T.d.name+' calls='+R.info.render.calls+' tris='+R.info.render.triangles})()")]
run(W+'/Poly-Tourismo.html',st,'pf9')
