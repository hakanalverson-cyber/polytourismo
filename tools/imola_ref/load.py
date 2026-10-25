# load the reference model once, transform every mesh into our world coords, save per-material triangle soups
import trimesh,numpy as np,json,collections
s=trimesh.load('/mnt/project-files/imola_circuit_2024_layout.glb',process=False)
f=json.load(open('fit.json'));R=np.array(f['R']);t=np.array(f['t']);sc=f['s']
out=collections.defaultdict(list);uvs=collections.defaultdict(list)
for nm in s.graph.nodes_geometry:
  T,g=s.graph[nm];m=s.geometry[g];mn=getattr(getattr(m.visual,'material',None),'name','') or 'none'
  v=trimesh.transform_points(m.vertices,T);q=((v[:,[0,2]]-t)@R)/sc;y=v[:,1]/sc+14.5
  P=np.c_[q[:,0],y,q[:,1]].astype(np.float32);out[mn].append(P[m.faces])
np.savez_compressed('tris.npz',**{k.replace('.','_').replace(' ','_'):np.concatenate(v) for k,v in out.items()})
print({k:sum(len(x) for x in v) for k,v in out.items()})
