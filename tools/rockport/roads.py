# road network from the road meshes: raster (2 m) -> skeleton -> polylines; plus stops and spawn
import sys,json,numpy as np,time
from scipy import ndimage
from skimage.morphology import skeletonize
D,OUT=sys.argv[1],sys.argv[2]
SX,SZ=2200.,6900.;W=10240;RC=2;RN=W//RC
P=[]
for i in range(1,14):
    z=np.load(f'{D}/p{i}.npz'); c=z['C'].astype(float)/255; v=c.max(1); s_=(c.max(1)-c.min(1))/np.maximum(v,1e-3)
    m=z['R']|((z['K']==0)&z['X']&(s_<.18)&(v>.15)&(v<.55)); P.append(z['P'][m])
P=np.concatenate(P).astype(np.float64);P[:,:,0]+=SX;P[:,:,2]+=SZ
nrm=np.cross(P[:,1]-P[:,0],P[:,2]-P[:,0]); nl=np.linalg.norm(nrm,axis=1)+1e-9; up=np.abs(nrm[:,1])/nl>.8
P=P[up]; area=nl[up]*.5
ns=np.clip((area/1.0).astype(int),1,4000); rep=np.repeat(np.arange(len(P)),ns); r=np.random.default_rng(2)
a=r.random(len(rep));b=r.random(len(rep));f=a+b>1;a[f]=1-a[f];b[f]=1-b[f]
pts=P[rep,0]+(P[rep,1]-P[rep,0])*a[:,None]+(P[rep,2]-P[rep,0])*b[:,None]
gi=np.clip((pts[:,0]/RC).astype(int),0,RN-1);gj=np.clip((pts[:,2]/RC).astype(int),0,RN-1)
M=np.zeros((RN,RN),bool);M[gj,gi]=True
Y=np.full((RN,RN),-1e9,np.float32);np.maximum.at(Y,(gj,gi),pts[:,1].astype(np.float32))
M=ndimage.binary_closing(M,iterations=2);M=ndimage.binary_opening(M,iterations=1)
# drop tiny blobs (bits of driveway)
lab,n=ndimage.label(M);sz=ndimage.sum(M,lab,range(1,n+1));keep=np.zeros(n+1,bool);keep[1:]=sz>400;M=keep[lab]
dist=ndimage.distance_transform_edt(M)*RC
# fill Y holes from neighbours (closing added cells)
yi=ndimage.distance_transform_edt(Y<-1e8,return_distances=False,return_indices=True);Y=Y[yi[0],yi[1]]
t0=time.time();S=skeletonize(M);print('skeleton',S.sum(),round(time.time()-t0))
# graph tracing
ys,xs=np.nonzero(S);idx=-np.ones((RN,RN),np.int64);idx[ys,xs]=np.arange(len(xs))
nb=[(-1,-1),(-1,0),(-1,1),(0,-1),(0,1),(1,-1),(1,0),(1,1)]
def neigh(k):
    y,x=ys[k],xs[k];o=[]
    for dy,dx in nb:
        yy,xx=y+dy,x+dx
        if 0<=yy<RN and 0<=xx<RN and idx[yy,xx]>=0:o.append(int(idx[yy,xx]))
    return o
deg=np.zeros(len(xs),np.int8)
for dy,dx in nb:
    sh=np.zeros_like(S);sy=slice(max(dy,0),RN+min(dy,0));sx=slice(max(dx,0),RN+min(dx,0));ty=slice(max(-dy,0),RN+min(-dy,0));tx=slice(max(-dx,0),RN+min(-dx,0))
    sh[ty,tx]=S[sy,sx];deg+=sh[ys,xs]
node=deg!=2
visited=set();polys=[]
def walk(a,b):
    path=[a,b];prev,cur=a,b
    while not node[cur]:
        nx=[q for q in neigh(cur) if q!=prev and q not in path[-3:]]
        if not nx:break
        prev,cur=cur,nx[0];path.append(cur)
        if len(path)>20000:break
    return path
for k in np.flatnonzero(node):
    for q in neigh(k):
        e=(min(k,q),max(k,q))
        if e in visited:continue
        p=walk(k,q)
        for i in range(len(p)-1):visited.add((min(p[i],p[i+1]),max(p[i],p[i+1])))
        polys.append(p)
print('raw polylines',len(polys))
def rdp(pt,eps):
    if len(pt)<3:return pt
    a,b=pt[0],pt[-1];ab=b-a;L=np.hypot(*ab)+1e-9
    d=np.abs(ab[0]*(pt[:,1]-a[1])-ab[1]*(pt[:,0]-a[0]))/L;i=int(np.argmax(d))
    if d[i]>eps:return np.vstack([rdp(pt[:i+1],eps)[:-1],rdp(pt[i:],eps)])
    return np.vstack([a,b])
roads=[]
for p in polys:
    p=np.array(p);x=(xs[p]+.5)*RC;z=(ys[p]+.5)*RC;L=np.hypot(np.diff(x),np.diff(z)).sum()
    endf=node[p[0]]&(deg[p[0]]==1)|node[p[-1]]&(deg[p[-1]]==1)
    if L<(40 if endf else 6):continue
    q=rdp(np.stack([x,z],1),1.5)
    # resample every ~6 m
    seg=np.hypot(*np.diff(q,axis=0).T);cum=np.r_[0,np.cumsum(seg)];n=max(2,int(cum[-1]/6)+1);s=np.linspace(0,cum[-1],n)
    rx=np.interp(s,cum,q[:,0]);rz=np.interp(s,cum,q[:,1])
    ii=np.clip((rx/RC).astype(int),0,RN-1);jj=np.clip((rz/RC).astype(int),0,RN-1)
    ry=ndimage.uniform_filter1d(Y[jj,ii].astype(np.float64),5,mode='nearest')
    hw=float(np.clip(np.median(dist[jj,ii]),3,16))
    roads.append({'x':[round(v,1) for v in rx],'z':[round(v,1) for v in rz],'y':[round(v,2) for v in ry],'hw':round(hw,1),'L':float(cum[-1])})
print('roads',len(roads),'km',round(sum(r['L'] for r in roads)/1000,1))
np.save(OUT+'_roadmask.npy',np.packbits(M))
json.dump(roads,open(OUT+'_roads.json','w'),separators=(',',':'))
