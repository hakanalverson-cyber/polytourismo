# centreline, ground height grid, surface classes and wall segments for the bought cartoon Imola, in game metres (x,z,y = model*S)
import numpy as np,json,sys
from scipy.spatial import cKDTree
SP='/tmp/claude-0/-home-claude-polytourismo/4b0e7c59-35bd-554a-8c30-0ab78fa183a0/scratchpad/cimola/'
S=float(sys.argv[1]) if len(sys.argv)>1 else .05
d=np.load(SP+'raw.npz');G=lambda n:(d[n+'_v'].astype(np.float64)*S,d[n+'_f'],d[n+'_uv'])
# ---- centreline from the asphalt strip: uv.v .75/1 are its two edges, uv.u runs along the lap
v,f,uv=G('imola_track_surface_road_imola_0')
A=uv[:,1]<.76;B=uv[:,1]>.99
def edge(m):
  u=uv[m,0];p=v[m];o=np.argsort(u);u=u[o];p=p[o];_,k=np.unique(np.round(u,4),return_index=True);return u[k],p[k]
ua,pa=edge(A);ub,pb=edge(B);pbi=np.c_[[np.interp(ua,ub,pb[:,j]) for j in range(3)]].T
C=(pa+pbi)/2;W=np.linalg.norm((pa-pbi)[:,[0,2]],axis=1)
# drop duplicated closing section (u wraps): keep points until the loop closes
L=np.r_[0,np.cumsum(np.linalg.norm(np.diff(C[:,[0,2]],axis=0),axis=1))]
# resample every ~8 m along the closed loop (linear), then light smoothing
Cc=np.r_[C,C[:1]];Wc=np.r_[W,W[:1]];Lc=np.r_[0,np.cumsum(np.linalg.norm(np.diff(Cc[:,[0,2]],axis=0),axis=1))]
n=int(Lc[-1]/8);s=np.linspace(0,Lc[-1],n,endpoint=False)
R=np.c_[[np.interp(s,Lc,Cc[:,j]) for j in range(3)]].T;Wr=np.interp(s,Lc,Wc)
def sm(a,k):
  out=a.copy()
  for _ in range(k):out=(np.roll(out,1,0)+2*out+np.roll(out,-1,0))/4
  return out
R=sm(R,3);Wr=sm(Wr,3)
# ---- direction and start: follow the old layout (fit.json maps model x,z onto it)
F=json.load(open('fit.json'));Rm=np.array(F['R'])
old=open('../../src/layers/imola_data.js').read();op=np.array(json.loads(old[old.index('{'):old.rindex('}')+1])['pts'])
q=(F['s']*(Rm@(R[:,[0,2]]/S*np.array([1,F['mir']])).T)).T+F['t'];_,oi=cKDTree(op[:,:2]).query(q)
dk=np.diff(oi);dk=(dk+len(op)//2)%len(op)-len(op)//2
if np.sum(dk)<0:R=R[::-1];Wr=Wr[::-1];q=q[::-1];oi=oi[::-1]
sl=d['imola_startlights_led_c001_startlights_0_v'].mean(0)*S;st=int(np.argmin(np.linalg.norm(R[:,[0,2]]-sl[[0,2]],axis=1)));R=np.roll(R,-st,0);Wr=np.roll(Wr,-st);print('start idx',st,'pts',len(R),'lap m',round(Lc[-1]),'width',np.percentile(Wr,[5,50,95]))
pts=[[round(a[0],2),round(a[2],2),round(a[1],2),round(w/2,2)] for a,w in zip(R,Wr)]
# ---- ground height + class grid (2 m cells): top-most ground surface; class 0 grass,1 asphalt,2 paved run-off,3 gravel
CELL=2.;layers=[('imola_bottom_rock_0',0),('imola_grass_1_nocol_grass_1_0',0),('imola_grass_2_grass_2_0',0),('imola_gravel_nocol1_gravel_0',3),('imola_stadium_road_imola_0',2),('imola_logo_ground_imola_ground_logo_0',2),('imola_track_surface_road_imola_0',1)]
allv=np.concatenate([G(n)[0] for n,_ in layers]);x0,z0=np.floor(allv[:,[0,2]].min(0)/CELL)*CELL;x1,z1=np.ceil(allv[:,[0,2]].max(0)/CELL)*CELL
nx,nz=int((x1-x0)/CELL)+1,int((z1-z0)/CELL)+1;H=np.full((nz,nx),-1e9);K=np.zeros((nz,nx),np.uint8);print('grid',nx,nz)
for n,cl in layers:
  v,f,_=G(n);T=v[f]
  for t in T:
    a,b,c=t[:,[0,2]];mn=np.floor((np.minimum(np.minimum(a,b),c)-[x0,z0])/CELL).astype(int);mx=np.ceil((np.maximum(np.maximum(a,b),c)-[x0,z0])/CELL).astype(int)
    mn=np.maximum(mn,0);mx=np.minimum(mx,[nx-1,nz-1])
    if (mx<mn).any():continue
    gx,gz=np.meshgrid(np.arange(mn[0],mx[0]+1),np.arange(mn[1],mx[1]+1));px=x0+gx*CELL;pz=z0+gz*CELL
    d0=b-a;d1=c-a;den=d0[0]*d1[1]-d0[1]*d1[0]
    if abs(den)<1e-9:continue
    wx=px-a[0];wz=pz-a[1];l1=(wx*d1[1]-wz*d1[0])/den;l2=(d0[0]*wz-d0[1]*wx)/den;l0=1-l1-l2;e=-1e-3
    m=(l0>=e)&(l1>=e)&(l2>=e)
    if not m.any():continue
    h=l0*t[0,1]+l1*t[1,1]+l2*t[2,1];gz_,gx_=gz[m],gx[m];hm=h[m]
    up=hm>H[gz_,gx_]-(0.02 if cl else -0.02)
    H[gz_[up],gx_[up]]=np.maximum(H[gz_[up],gx_[up]],hm[up]) if cl==0 else hm[up];K[gz_[up],gx_[up]]=cl
# holes: nearest valid
from scipy import ndimage
bad=H<-1e8
if bad.any():
  _,(iz,ix)=ndimage.distance_transform_edt(bad,return_indices=True);H=H[iz,ix]
print('h range',H.min(),H.max(),'classes',np.bincount(K.ravel()))
Hq=np.clip(np.round(H/.02),-32767,32767).astype(np.int16)
# RLE of the class grid per row: [value,count] pairs as bytes (count<=255)
rle=[]
for row in K:
  i=0
  while i<len(row):
    j=i
    while j<len(row) and row[j]==row[i] and j-i<255:j+=1
    rle+= [row[i],j-i];i=j
rle=np.array(rle,np.uint8)
# ---- wall segments from the collider meshes (vertical sheets: project each triangle to its longest 2D edge)
segs=[]
for n in ['collider_01_collider_0','collider_02_collider_0','collider_03_collider_0','collider_004_collider_0']:
  v,f,_=G(n)
  for t in v[f]:
    p=t[:,[0,2]];e=[(p[0],p[1]),(p[1],p[2]),(p[2],p[0])];a,b=max(e,key=lambda q:np.linalg.norm(q[0]-q[1]))
    if np.linalg.norm(a-b)<.3:continue
    u_=p[1]-p[0];w_=p[2]-p[0];area2=abs(u_[0]*w_[1]-u_[1]*w_[0])
    if area2>np.linalg.norm(a-b)*1.0:continue  # not a vertical sheet
    segs.append([a[0],a[1],b[0],b[1]])
segs=np.unique(np.round(np.array(segs),2),axis=0)
# drop any segment crossing the asphalt (stray long triangles)
cl=np.c_[R[:,0],R[:,2]];tree=cKDTree(cl);keep=[]
for sgm in segs:
  a,b=sgm[:2],sgm[2:];k=max(2,int(np.linalg.norm(b-a)/1.5));t=np.linspace(0,1,k)[:,None];P=a*(1-t)+b*t;dd,ii=tree.query(P)
  keep.append(not (dd<Wr[ii]/2+0.5).any())
segs=segs[np.array(keep)];print('wall segs',len(segs))
json.dump({'S':S,'pts':pts,'grid':{'x0':x0,'z0':z0,'nx':nx,'nz':nz,'cell':CELL},'segs':np.round(segs,2).tolist()},open(SP+'track.json','w'))
Hq.tofile(SP+'hf.i16');rle.tofile(SP+'cls.rle')
