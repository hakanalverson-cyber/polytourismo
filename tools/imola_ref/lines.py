# barriers as polylines traced along the model's own geometry: rasterise at 0.25 m, skeletonise, walk the skeleton, simplify
import numpy as np,json,sys
sys.setrecursionlimit(100000)
from skimage.draw import polygon
from skimage.morphology import skeletonize
from scipy import ndimage
D=np.load('tris.npz');hf=np.load('hf.npz');G1=hf['ground'];X0,Z0=-150,-200;C=.25;W,H=int(2550/C),int(1700/C)
def ground(x,z):
  i=np.clip(((z-Z0)).astype(int),0,G1.shape[0]-1);j=np.clip(((x-X0)).astype(int),0,G1.shape[1]-1);return G1[i,j]
CL={'wall':['walls_001','whiteconc_001'],'rail':['grail_002'],'fence':['fences_001','box_fence_001'],'tyre':['tyrewall_001']}
def rdp(p,eps):
  if len(p)<3:return p
  a,b=p[0],p[-1];ab=b-a;L=np.hypot(*ab)
  d=np.abs(ab[0]*(p[:,1]-a[1])-ab[1]*(p[:,0]-a[0]))/L if L>1e-9 else np.hypot(*(p-a).T)
  i=int(np.argmax(d))
  if d[i]>eps:return np.vstack([rdp(p[:i+1],eps)[:-1],rdp(p[i:],eps)])
  return np.vstack([a,b])
res={}
for cl,names in CL.items():
  T=np.concatenate([D[n] for n in names]);M=np.zeros((H,W),bool);top=np.full((H,W),-1e9,np.float32);bot=np.full((H,W),1e9,np.float32)
  for tri in T:
    xs=(tri[:,0]-X0)/C;zs=(tri[:,2]-Z0)/C
    if xs.min()<0 or zs.min()<0 or xs.max()>=W or zs.max()>=H:continue
    rr,cc=polygon(zs,xs,(H,W))
    if len(rr)==0:rr=np.array([int(zs.mean())]);cc=np.array([int(xs.mean())])
    M[rr,cc]=True;np.maximum.at(top,(rr,cc),tri[:,1].max());np.minimum.at(bot,(rr,cc),tri[:,1].min())
  M=ndimage.binary_closing(ndimage.binary_dilation(M,iterations=2 if cl!="fence" else 5),iterations=3 if cl!="fence" else 6)
  top=ndimage.grey_dilation(top,size=5);bot=-ndimage.grey_dilation(-bot,size=5)
  S=skeletonize(M);ys,xs=np.nonzero(S);idx={(y,x):i for i,(y,x) in enumerate(zip(ys,xs))}
  nb=[[] for _ in ys]
  for i,(y,x) in enumerate(zip(ys,xs)):
    for dy in(-1,0,1):
      for dx in(-1,0,1):
        if (dy or dx) and (y+dy,x+dx) in idx:nb[i].append(idx[(y+dy,x+dx)])
  deg=np.array([len(n) for n in nb]);seen=np.zeros(len(ys),bool);lines=[]
  def walk(s):
    path=[s];seen[s]=True;cur=s
    while True:
      nx=[j for j in nb[cur] if not seen[j]]
      if not nx:break
      cur=nx[0];seen[cur]=True;path.append(cur)
      if deg[cur]>2:break
    return path
  for s in list(np.nonzero(deg==1)[0])+list(np.nonzero(deg>2)[0])+list(range(len(ys))):
    if seen[s] and deg[s]<=2:continue
    for j in nb[s]:
      if seen[j]:continue
      seen[s]=True;p=[s]+walk(j);lines.append(p)
    if not seen[s]:
      seen[s]=True
  out=[]
  for p in lines:
    if len(p)<8:continue
    pts=np.c_[X0+(xs[p]+.5)*C,Z0+(ys[p]+.5)*C]
    L=np.hypot(*np.diff(pts,axis=0).T).sum()
    if L<3:continue
    sp=rdp(pts,.2)
    # resample so no segment is longer than 4 m (the barrier follows the ground)
    rs=[sp[0]]
    for a,b in zip(sp[:-1],sp[1:]):
      n=int(np.ceil(np.hypot(*(b-a))/4))
      for t in range(1,n+1):rs.append(a+(b-a)*t/n)
    rs=np.array(rs);ri=np.clip(((rs[:,1]-Z0)/C).astype(int),0,H-1);ci=np.clip(((rs[:,0]-X0)/C).astype(int),0,W-1)
    g=ground(rs[:,0],rs[:,1]);tp=top[ri,ci]-g;bt=bot[ri,ci]-g
    tp=np.where(np.abs(tp)<60,tp,np.nan);bt=np.where(np.abs(bt)<60,bt,np.nan)
    th=np.nanmedian(tp) if np.isfinite(tp).any() else 1;bh=np.nanmedian(bt) if np.isfinite(bt).any() else 0
    out.append({'p':np.round(rs,2).tolist(),'h':round(float(th),2),'b':round(float(bh),2)})
  res[cl]=out;print(cl,len(out),'lines',sum(len(o['p']) for o in out),'pts','len',round(sum(np.hypot(*np.diff(np.array(o['p']),axis=0).T).sum() for o in out)))
json.dump(res,open('lines.json','w'))
