# driving data for a cartoon track pack: centreline, 1.5 m ground height + surface-class grid, wall segments (game metres)
# usage: track.py <config.json>
import numpy as np,json,sys,re
from scipy.spatial import cKDTree
from scipy import ndimage
sys.path.insert(0,__file__.rsplit('/',1)[0]);from rast import raster
C=json.load(open(sys.argv[1]));W=C['work'];d=np.load(W+'/raw.npz')
names=sorted(set(k[:-2] for k in d.files if k.endswith('_v')))
pick=lambda pat:[n for n in names if re.search(pat,n)]
def cat(pat):
  vs,fs,o=[],[],0
  for n in pick(pat):vs.append(d[n+'_v'].astype(np.float64));fs.append(d[n+'_f']+o);o+=len(vs[-1])
  return np.concatenate(vs),np.concatenate(fs)
cc=C['centre']
# ---- scale: fixed, or chosen so the median road width matches
def strip(v,f,uv):
  A=uv[:,1]<cc['vlo'];B=uv[:,1]>cc['vhi']
  def edge(m):
    u=uv[m,0];p=v[m];o=np.argsort(u);u=u[o];p=p[o];_,k=np.unique(np.round(u,4),return_index=True);return u[k],p[k]
  ua,pa=edge(A);ub,pb=edge(B);pbi=np.c_[[np.interp(ua,ub,pb[:,j]) for j in range(3)]].T
  return (pa+pbi)/2,np.linalg.norm((pa-pbi)[:,[0,2]],axis=1)
def skeleton(v,f):
  # the road mask is a ring: walk its outer contour, pair each point with the nearest point of the inner contour
  from skimage import measure
  cell=cc.get('cell',.25);x0,z0=v[:,[0,2]].min(0)-4*cell;nx,nz=(np.ceil((v[:,[0,2]].max(0)-[x0,z0])/cell)+8).astype(int)
  H=raster(v,f,x0,z0,nx,nz,cell);M=~np.isnan(H);M=ndimage.binary_closing(M,iterations=3);M=ndimage.binary_opening(M,iterations=2)
  lab,nl=ndimage.label(M);M=lab==np.argmax(np.bincount(lab.ravel())[1:])+1
  cs=sorted(measure.find_contours(M.astype(float),.5),key=lambda c:-len(c));out,inn=cs[0],cs[1]
  def rs(c,step):
    L=np.r_[0,np.cumsum(np.linalg.norm(np.diff(c,axis=0),axis=1))];s_=np.arange(0,L[-1],step);return np.c_[np.interp(s_,L,c[:,0]),np.interp(s_,L,c[:,1])]
  out=rs(out,4);inn=np.concatenate([rs(c,1) for c in cs[1:] if len(c)>40]);_,ii=cKDTree(inn).query(out);mid=(out+inn[ii])/2;w=np.linalg.norm(out-inn[ii],axis=1)*cell
  Hf=np.where(np.isnan(H),np.nanmean(H),H);hy=Hf[np.clip(mid[:,0].round().astype(int),0,nz-1),np.clip(mid[:,1].round().astype(int),0,nx-1)]
  print('contours',len(cs),'outer',len(cs[0]),'inner',len(cs[1]))
  return np.c_[x0+mid[:,1]*cell,hy,z0+mid[:,0]*cell],w
v,f=cat(cc['mesh'])
if cc['method']=='strip':
  uv=np.concatenate([d[n+'_uv'] for n in pick(cc['mesh'])]);Cl,Wd=strip(v,f,uv)
else:Cl,Wd=skeleton(v,f)
S=C.get('S') or C['width']/np.median(Wd);Cl=Cl*S;Wd=Wd*S;print('S',S)
G=lambda n:(d[n+'_v'].astype(np.float64)*S,d[n+'_f'],d[n+'_uv'])
Cc=np.r_[Cl,Cl[:1]];Wc=np.r_[Wd,Wd[:1]];Lc=np.r_[0,np.cumsum(np.linalg.norm(np.diff(Cc[:,[0,2]],axis=0),axis=1))]
n=int(Lc[-1]/8);s=np.linspace(0,Lc[-1],n,endpoint=False)
R=np.c_[[np.interp(s,Lc,Cc[:,j]) for j in range(3)]].T;Wr=np.interp(s,Lc,Wc)
def sm(a,k):
  o=a.copy()
  for _ in range(k):o=(np.roll(o,1,0)+2*o+np.roll(o,-1,0))/4
  return o
R=sm(R,3);Wr=sm(Wr,4)
area=0.5*np.sum(R[:,0]*np.roll(R[:,2],-1)-np.roll(R[:,0],-1)*R[:,2])
if np.sign(area)!=C['sign']:R=R[::-1];Wr=Wr[::-1]
st=C['start'];sv=np.concatenate([d[n+'_v'] for n in pick(st['mesh'])]).astype(np.float64)*S
if st['mode']=='centroid':k0=int(np.argmin(np.linalg.norm(R[:,[0,2]]-sv.mean(0)[[0,2]],axis=1)))
else:  # the furthest point of the start boxes along the lap, plus a few metres
  _,ii=cKDTree(R[:,[0,2]]).query(sv[:,[0,2]]);ii=np.unique(ii);c0=int(np.median(ii));rel=(ii-c0+len(R)//2)%len(R)-len(R)//2;k0=(c0+rel.max()+int(st.get('ahead',6)/8))%len(R)
R=np.roll(R,-k0,0);Wr=np.roll(Wr,-k0)
print('pts',len(R),'lap m',round(Lc[-1]),'width',np.percentile(Wr,[5,50,95]).round(1))
pts=[[round(a[0],2),round(a[2],2),round(a[1],2),round(w/2,2)] for a,w in zip(R,Wr)]
# ---- ground grid: top-most ground layer per cell; layers lifted a few cm apart (same lifts as the meshes)
CELL=C.get('cell',1.5);layers=[]
for pat,cl,lift in C['ground']:
  for nm in pick(pat):layers.append((nm,cl,lift))
allv=np.concatenate([G(n)[0] for n,_,_ in layers]);x0,z0=np.floor(allv[:,[0,2]].min(0)/CELL)*CELL;x1,z1=np.ceil(allv[:,[0,2]].max(0)/CELL)*CELL
nx,nz=int((x1-x0)/CELL)+1,int((z1-z0)/CELL)+1;H=np.full((nz,nx),-1e9);K=np.zeros((nz,nx),np.uint8)
# the circuit asphalt is always kept; any other layer more than 2.5 m above what is already there is a bridge deck over it (Road Atlanta's paddock road): keep the lower surface.
# the rock shell under the world only fills cells nothing else covers.
RK=np.zeros((nz,nx),bool);rockpat=C.get('rock')
for nm,cl,lift in layers:
  v,f,_=G(nm);v=v+[0,lift,0];h=raster(v,f,x0,z0,nx,nz,CELL);ok=~np.isnan(h);unset=H<-1e8
  if rockpat and re.search(rockpat,nm):m=ok&unset;RK|=m
  elif cl==1:m=ok  # the circuit's own asphalt always wins (bridges cross over it and under it)
  else:m=ok&(unset|RK|((h>=H-.02)&(h<=H+2.5)));RK&=~m
  H[m]=h[m];K[m]=cl
bad=H<-1e8
if bad.any():_,(iz,ix)=ndimage.distance_transform_edt(bad,return_indices=True);H=H[iz,ix]
print('grid',nx,nz,'classes',np.bincount(K.ravel(),minlength=4))
Hq=np.clip(np.round(H/.02),-32767,32767).astype(np.int16)
rle=[]
for row in K:
  i=0
  while i<len(row):
    j=i
    while j<len(row) and row[j]==row[i] and j-i<255:j+=1
    rle+=[row[i],j-i];i=j
# ---- walls: collider sheets projected to 2D; anything crossing the asphalt is dropped
segs=[]
for nm in pick(C['colliders']):
  v,f,_=G(nm)
  for t in v[f]:
    p=t[:,[0,2]];e=[(p[0],p[1]),(p[1],p[2]),(p[2],p[0])];a,b=max(e,key=lambda q:np.linalg.norm(q[0]-q[1]))
    L=np.linalg.norm(a-b)
    if L<.3:continue
    u_=p[1]-p[0];w_=p[2]-p[0]
    if abs(u_[0]*w_[1]-u_[1]*w_[0])>L*1.0:continue
    segs.append([a[0],a[1],b[0],b[1]])
segs=np.unique(np.round(np.array(segs),2),axis=0) if segs else np.zeros((0,4))
tree=cKDTree(R[:,[0,2]]);keep=[]
for sg in segs:
  a,b=sg[:2],sg[2:];k=max(2,int(np.linalg.norm(b-a)/1.5));t=np.linspace(0,1,k)[:,None];Pp=a*(1-t)+b*t;dd,ii=tree.query(Pp);keep.append(not(dd<Wr[ii]/2+.5).any())
segs=segs[np.array(keep,bool)] if len(segs) else segs;print('wall segs',len(segs))
json.dump({'S':S,'pts':pts,'grid':{'x0':x0,'z0':z0,'nx':nx,'nz':nz,'cell':CELL},'segs':np.round(segs,2).tolist()},open(W+'/track.json','w'))
Hq.tofile(W+'/hf.i16');np.array(rle,np.uint8).tofile(W+'/cls.rle')
