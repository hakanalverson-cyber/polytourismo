# per-face colour (texture sampled at the face's UV centre, times base factor), same order as tris.npz
import trimesh,numpy as np,collections
s=trimesh.load('/mnt/project-files/imola_circuit_2024_layout.glb',process=False)
out=collections.defaultdict(list);cache={}
for nm in s.graph.nodes_geometry:
  T,g=s.graph[nm];m=s.geometry[g];mt=getattr(m.visual,'material',None);mn=getattr(mt,'name','') or 'none'
  nf=len(m.faces);col=np.full((nf,3),180,np.uint8)
  try:
    im=getattr(mt,'baseColorTexture',None) or getattr(mt,'image',None)
    f=getattr(mt,'baseColorFactor',None);fac=np.ones(3) if f is None else np.array(f[:3],float)/(255. if max(f[:3])>1 else 1.)
    if im is not None and getattr(m.visual,'uv',None) is not None:
      if mn not in cache:cache[mn]=np.asarray(im.convert('RGB'))
      A=cache[mn];h,w=A.shape[:2];uv=m.visual.uv[m.faces].mean(1)%1.0
      x=np.clip((uv[:,0]*w).astype(int),0,w-1);y=np.clip(((1-uv[:,1])*h).astype(int),0,h-1);col=np.clip(A[y,x]*fac,0,255).astype(np.uint8)
    elif f is not None:col[:]=np.clip(fac*255,0,255).astype(np.uint8)
  except Exception as e:print('err',mn,e)
  out[mn].append(col)
np.savez_compressed('cols.npz',**{k.replace('.','_').replace(' ','_'):np.concatenate(v) for k,v in out.items()})
