from shot import run,W
js="""(()=>{const out={};for(let tr=0;tr<D.length;tr++){
 PT8.launch({mode:'ta',track:tr,laps:1,humans:[{id:'merc',alt:0}],ai:[]});const T=RACE.T,sc=RACE.scene;sc.updateMatrixWorld(true);
 const rep={inst:0,floatN:0,buryN:0,worst:[],meshes:0};const m4=new THREE.Matrix4(),v=new THREE.Vector3(),bb=new THREE.Box3();
 const gy=(x,z)=>T.d.harbor?-.06:T.d.sea?T.terr(x,z):T.terr(x,z);
 sc.traverse(o=>{
  if(o.isInstancedMesh&&o.geometry){o.geometry.computeBoundingBox();const g=o.geometry.boundingBox;
   for(let i=0;i<o.count;i++){o.getMatrixAt(i,m4);m4.premultiply(o.matrixWorld);bb.copy(g).applyMatrix4(m4);const cx=(bb.min.x+bb.max.x)/2,cz=(bb.min.z+bb.max.z)/2,base=bb.min.y,top=bb.max.y;if(top-base>200||top-base<.2)continue;
    const road=T.surf?0:0;let ground=gy(cx,cz);
    let nearRoad=1e9;for(let k=0;k<T.N;k+=3){const dd=Math.hypot(cx-T.x[k],cz-T.z[k]);if(dd<nearRoad){nearRoad=dd;if(dd<T.hw[k]+14){ground=Math.min(ground,T.y[k])}}}
    rep.inst++;const gap=base-ground;if(gap>.6){rep.floatN++;if(rep.worst.length<4)rep.worst.push(['float',+gap.toFixed(1),cx|0,cz|0,+(top-base).toFixed(1)])}else if(gap<-3.2){rep.buryN++}}}
 });
 out[tr]=rep}return out})()"""
run(W+'/Poly-Tourismo.html',[('js',js)],'audit')
