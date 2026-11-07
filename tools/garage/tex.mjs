// Textured career garage: node tools/garage/tex.mjs Garage_512.glb garage_tex.glb 0.2 0.005, then gltf-transform quantize. Input = Garage.glb after gltf-transform resize --width 512 --height 512. Output goes to /mnt/project-files/poly-gt/packs/ (never into git).
import {NodeIO} from '@gltf-transform/core';import {ALL_EXTENSIONS} from '@gltf-transform/extensions';import {prune,weld,simplify,dedup,normals} from '@gltf-transform/functions';import {MeshoptSimplifier} from 'meshoptimizer';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS);const d=await io.read(process.argv[2]);
for(const n of d.getRoot().listNodes()){const nm=n.getName()||'';if(/^(EngineBlock|Temp:|IMS_Humo|Piston)/.test(nm))n.dispose()}
for(const m of d.getRoot().listMeshes())for(const p of m.listPrimitives()){for(const s of p.listSemantics())if(!['POSITION','TEXCOORD_0'].includes(s))p.setAttribute(s,null)}
for(const m of d.getRoot().listMaterials()){m.setOcclusionTexture(null);}
await MeshoptSimplifier.ready;
await d.transform(prune(),dedup(),weld({tolerance:0.0005}),simplify({simplifier:MeshoptSimplifier,ratio:+process.argv[4],error:+process.argv[5],lockBorder:false}),normals({overwrite:true}),prune());
let t=0;for(const m of d.getRoot().listMeshes())for(const p of m.listPrimitives())t+=p.getIndices()?p.getIndices().getCount()/3:0;console.log('tris',t);
await io.write(process.argv[3],d);
