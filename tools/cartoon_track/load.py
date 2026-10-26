# load a bought cartoon-track GLB once: per-mesh world-space vertices (model units, Y up), faces, uvs, plus each mesh's material texture / colour
# usage: load.py <glb> <work dir>
import trimesh,numpy as np,sys,json,struct,os
glb,W=sys.argv[1],sys.argv[2];os.makedirs(W,exist_ok=True)
f=open(glb,'rb');f.read(12);l,_=struct.unpack('<II',f.read(8));J=json.loads(f.read(l))
mats={m['name']:m for m in J.get('materials',[])}
def texof(mn):
  m=mats.get(mn,{});pb=m.get('pbrMetallicRoughness',{});t=pb.get('baseColorTexture')
  uri=None
  if t is not None:uri=J['images'][J['textures'][t['index']]['source']].get('uri')
  return uri,pb.get('baseColorFactor',[1,1,1,1]),m.get('alphaMode','')
s=trimesh.load(glb,process=False);out={};meta={}
for nm in s.graph.nodes_geometry:
  T,g=s.graph[nm];m=s.geometry[g];v=trimesh.transform_points(m.vertices,T).astype(np.float32)
  uv=getattr(m.visual,'uv',None);uv=np.zeros((len(v),2),np.float32) if uv is None else uv.astype(np.float32)
  k=nm;i=0
  while k+'_v' in out:i+=1;k=nm+'#%d'%i
  out[k+'_v']=v;out[k+'_f']=m.faces.astype(np.int32);out[k+'_uv']=uv
  mn=getattr(getattr(m.visual,'material',None),'name','') or ''
  uri,col,am=texof(mn);meta[k]={'mat':mn,'tex':uri,'col':col,'alpha':am}
np.savez_compressed(W+'/raw.npz',**out);json.dump(meta,open(W+'/meta.json','w'),indent=0)
print(len(meta),'meshes')
