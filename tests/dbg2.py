from shot import run,W
js="""(()=>{PT8.launch({mode:'ta',track:8,laps:3,humans:[{id:'merc',alt:0}],ai:[]});const sc=RACE.scene;sc.updateMatrixWorld(true);
const rc=new THREE.Raycaster(),dn=new THREE.Vector3(0,-1,0),objs=[];sc.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh&&!o.userData.ptProp&&o.visible)objs.push(o)});
const out=[];for(const p of sc.userData.props){if(p.water)continue;rc.set(new THREE.Vector3(p.x,40,p.z),dn);const h=rc.intersectObjects(objs,false).filter(q=>q.object.geometry.type!=='SphereGeometry');out.push([p.n,+p.y.toFixed(2),h.length?+h[0].point.y.toFixed(2):null,h.length?h[0].object.geometry.type:null])}return out})()"""
run(W+'/Poly-Tourismo.html',[('js',js)],'dbg')
