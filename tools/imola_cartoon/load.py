# load the bought cartoon Imola GLB once: per-mesh world-space triangles (model units, Y up) + uvs, saved to npz
import trimesh,numpy as np,sys
s=trimesh.load(sys.argv[1],process=False);out={}
for nm in s.graph.nodes_geometry:
  T,g=s.graph[nm];m=s.geometry[g];v=trimesh.transform_points(m.vertices,T).astype(np.float32)
  uv=getattr(m.visual,'uv',None);uv=np.zeros((len(v),2),np.float32) if uv is None else uv.astype(np.float32)
  k=nm;i=0
  while k in out or k+'_v' in out: i+=1;k=nm+'#%d'%i
  out[k+'_v']=v;out[k+'_f']=m.faces.astype(np.int32);out[k+'_uv']=uv
np.savez_compressed(sys.argv[2],**out)
