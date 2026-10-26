import trimesh,numpy as np,sys
s=trimesh.load(sys.argv[1],process=False)
for nm in s.graph.nodes_geometry:
  T,g=s.graph[nm];m=s.geometry[g];v=trimesh.transform_points(m.vertices,T)
  mat=getattr(m.visual,'material',None)
  col=getattr(mat,'baseColorFactor',None);tex=getattr(mat,'baseColorTexture',None)
  print(nm[:40].ljust(40),len(m.faces),np.round(v.min(0)),np.round(v.max(0)),col,'TEX' if tex is not None else '', 'uv' if getattr(m.visual,'uv',None) is not None else '')
