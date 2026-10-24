import sys
from shot import run,W
trk=sys.argv[1]
js=r"""(async()=>{const out=[];for(const tk of %s){try{PT8.dmgOn=()=>false;PT8.launch({mode:'ta',track:tk,laps:1,humans:[{id:'merc',alt:0}],ai:[]});scr='game';paused=false;
 for(let i=0;i<200;i++)step(1/60);RACE.state='race';const T=RACE.T;
 await new Promise(r=>setTimeout(r,1500));
 let info=null;const rr=R;await new Promise(r=>setTimeout(r,2500));
 if(rr){info=rr.info;}
 const sc=RACE.scene;let meshes=0,tris=0,inst=0,tex=0,lights=0,sh=0,tr=0,mats=new Set(),big=[];sc.traverse(o=>{if(o.isLight){lights++;if(o.castShadow)sh++}if(o.isMesh||o.isInstancedMesh){if(!o.visible)return;meshes++;const g=o.geometry;const n=g.index?g.index.count/3:g.attributes.position.count/3;const c=o.isInstancedMesh?o.count:1;tris+=n*c;if(o.isInstancedMesh)inst++;mats.add(o.material.uuid);if(o.material.transparent)tr++;big.push([Math.round(n*c),o.isInstancedMesh?'I'+o.count:'',o.material.type,o.frustumCulled])}});
 big.sort((a,b)=>b[0]-a[0]);
 out.push([tk,T.d.name,'meshes',meshes,'mats',mats.size,'tris',Math.round(tris),'inst',inst,'transp',tr,'lights',lights,'shadow',sh,JSON.stringify(big.slice(0,8)),(info&&info.render)?JSON.stringify({calls:info.render.calls,tri:info.render.triangles,geo:info.memory.geometries,tex:info.memory.textures,prog:info.programs&&info.programs.length,w:R.domElement.width}):'noinfo'+JSON.stringify(info)])}catch(e){out.push([tk,String(e)])}}return out.map(x=>x.slice(0,13).join(' ')+' '+x.slice(14).join(' ')).join('@@')})()""" % trk
run(W+'/Poly-Tourismo.html',[('js',js)],'perf')
