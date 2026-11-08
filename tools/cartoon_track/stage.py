# driving data for a point-to-point rally stage cut out of a bought cartoon rally map (a road network): route along the road skeleton, ground height + class grid,
# corridor walls, wall props, fords. Writes the same files track.py does (track.json, hf.i16, cls.rle) so mesh.py can finish the pack.
# usage: stage.py <config.json>
import numpy as np,json,sys,re,base64
from scipy.spatial import cKDTree
from scipy import ndimage
from scipy.ndimage import gaussian_filter1d
from skimage.morphology import skeletonize
import networkx as nx
sys.path.insert(0,__file__.rsplit('/',1)[0]);from rast import raster
C=json.load(open(sys.argv[1]));W=C['work'];d=np.load(W+'/raw.npz');S=C['S']
names=sorted(set(k[:-2] for k in d.files if k.endswith('_v')))
pick=lambda pat:[n for n in names if re.search(pat,n)]
def cat(pat):
  vs,fs,o=[],[],0
  for n in pick(pat):vs.append(d[n+'_v'].astype(np.float64));fs.append(d[n+'_f']+o);o+=len(vs[-1])
  return np.concatenate(vs),np.concatenate(fs)
SP=8.0  # game metres between route points
# ---- road mask and skeleton graph (model units)
v,f=cat(C['road']);cell=C.get('mcell',1.0)
x0,z0=v[:,[0,2]].min(0)-4*cell;nx_,nz_=(np.ceil((v[:,[0,2]].max(0)-[x0,z0])/cell)+8).astype(int)
H=raster(v,f,x0,z0,nx_,nz_,cell);M=~np.isnan(H);M=ndimage.binary_closing(M,iterations=2)
dt=ndimage.distance_transform_edt(M);K=skeletonize(M)
G=nx.Graph();ys,xs=np.nonzero(K);S_=set(zip(ys.tolist(),xs.tolist()))
for p in S_:
  for a,b in((0,1),(1,0),(1,1),(1,-1)):
    q=(p[0]+a,p[1]+b)
    if q in S_:G.add_edge(p,q,weight=np.hypot(a,b)*cell)
nodes=np.array(list(G.nodes));tree=cKDTree(nodes)
snap=lambda x,z:tuple(nodes[tree.query([(z-z0)/cell,(x-x0)/cell])[1]])
wp=[snap(*q) for q in C['route']];path=[wp[0]]
for a,b in zip(wp[:-1],wp[1:]):path+=nx.dijkstra_path(G,a,b)[1:]
# drop straight reversals (a waypoint on a side branch): a path that goes out and straight back
pa=np.array(path,float);print('route px',len(pa),'model length',round(sum(np.hypot(*np.diff(pa,axis=0).T))*cell))
# ---- smooth, scale, resample every SP game metres
px=gaussian_filter1d(x0+pa[:,1]*cell,3,mode='nearest')*S;pz=gaussian_filter1d(z0+pa[:,0]*cell,3,mode='nearest')*S
Hf=np.where(np.isnan(H),np.nanmean(H),H);_,(iz,ix)=ndimage.distance_transform_edt(np.isnan(H),return_indices=True);Hn=H[iz,ix]
py=Hn[pa[:,0].astype(int),pa[:,1].astype(int)]*S;wd=dt[pa[:,0].astype(int),pa[:,1].astype(int)]*2*cell*S
Lc=np.r_[0,np.cumsum(np.hypot(np.diff(px),np.diff(pz)))];n=int(Lc[-1]/SP);s=np.linspace(0,Lc[-1],n)
R=np.c_[np.interp(s,Lc,px),np.interp(s,Lc,pz),np.interp(s,Lc,py)];Wr=np.interp(s,Lc,wd)
Wr=ndimage.median_filter(Wr,size=9,mode='nearest')
for k in(0,1,2):R[:,k]=gaussian_filter1d(R[:,k],1.2 if k<2 else 2.0,mode='nearest')
Wr=gaussian_filter1d(Wr,3,mode='nearest');hw=np.clip(Wr/2,C.get('hwmin',3.4),C.get('hwmax',8.0))
print('stage points',n,'length m',round(Lc[-1]),'half width',np.percentile(hw,[5,50,95]).round(1))
nr=len(R)
# ---- close the loop out of sight: a short run-out past the finish, then a straight chord back to just before the start
def tang(i0,i1):
  t=R[i1,:2]-R[i0,:2];return t/np.linalg.norm(t)
tf=tang(nr-4,nr-1);ts=tang(0,3);out=[R[-1]+np.r_[tf*SP*k,0] for k in range(1,9)]
bk=[R[0]-np.r_[ts*SP*k,0] for k in range(8,0,-1)]
a=out[-1];b=bk[0];m=max(2,int(np.hypot(*(b-a)[:2])/SP));ch=[a+(b-a)*(k/m) for k in range(1,m)]
ext=np.array(out+ch+bk);full=np.r_[R,ext];hwf=np.r_[hw,np.full(len(ext),min(hw[-1],4.5))]
pts=[[round(p[0],2),round(p[1],2),round(p[2],2),round(w,2)] for p,w in zip(full,hwf)]
print('loop points',len(pts),'route',nr)
# ---- ground grid: top-most ground layer per cell, layers lifted a few cm apart; far cells copy the nearest near one so the data stays small
CELL=C.get('cell',2.0);layers=[]
for pat,cl,lift in C['ground']:
  for nm in pick(pat):layers.append((nm,cl,lift))
Gv=lambda n:(d[n+'_v'].astype(np.float64)*S,d[n+'_f'])
rt=cKDTree(R[:,:2]);rad=C.get('gridr',320)
gx0,gz0=np.floor((R[:,:2].min(0)-rad)/CELL)*CELL;gx1,gz1=np.ceil((R[:,:2].max(0)+rad)/CELL)*CELL
nx,nz=int((gx1-gx0)/CELL)+1,int((gz1-gz0)/CELL)+1;Hh=np.full((nz,nx),-1e9);Kc=np.zeros((nz,nx),np.uint8)
zz,xx=np.mgrid[0:nz,0:nx];near=rt.query(np.c_[(gx0+xx*CELL).ravel(),(gz0+zz*CELL).ravel()])[0].reshape(nz,nx)<rad
RK=np.zeros((nz,nx),bool);rockpat=C.get('rock')
for nm,cl,lift in layers:
  vv,ff=Gv(nm);vv=vv+[0,lift,0]
  # only triangles near the route (the maps are huge)
  ct=vv[ff].mean(1);keep=rt.query(ct[:,[0,2]])[0]<rad+60;ff=ff[keep]
  if not len(ff):continue
  h=raster(vv,ff,gx0,gz0,nx,nz,CELL);ok=~np.isnan(h);unset=Hh<-1e8
  if rockpat and re.search(rockpat,nm):m=ok&unset;RK|=m
  elif cl==1:m=ok
  else:m=ok&(unset|RK|((h>=Hh-.02)&(h<=Hh+2.5)));RK&=~m
  Hh[m]=h[m];Kc[m]=cl
bad=Hh<-1e8
if bad.any():_,(iz_,ix_)=ndimage.distance_transform_edt(bad,return_indices=True);Hh=Hh[iz_,ix_];Kc=Kc[iz_,ix_]
# far cells: copy the value of the nearest cell that is inside the radius (compresses to almost nothing)
far=~near
if far.any():_,(iz_,ix_)=ndimage.distance_transform_edt(far,return_indices=True);Hh=Hh[iz_,ix_];Kc=Kc[iz_,ix_]
print('grid',nx,nz,'classes',np.bincount(Kc.ravel(),minlength=4))
# ---- recentre on the drivable road. Curbs, parapets and wide shoulders can pull the skeleton off the middle of the deck (a viaduct with a drop on one
# side is where a car fell off). From every route point look sideways at the road-class cells that sit at the road's height, put the line in the middle
# of that run, and remember how far the road reaches and where the ground drops away, so the corridor walls can sit just outside the deck there.
WL=np.full((2,nr),np.nan)   # wall distance from the centre: [0] on the -normal side, [1] on the +normal side
if C.get('recentre',1):
  RCm=ndimage.binary_closing(Kc==1,iterations=1)
  tg0=np.gradient(R[:,:2],axis=0);tg0/=np.linalg.norm(tg0,axis=1)[:,None]+1e-9;nm0=np.c_[-tg0[:,1],tg0[:,0]]
  offs=np.arange(-10,10.01,.5);c0=len(offs)//2;sh=np.zeros(nr);wd2=np.full(nr,np.nan);lo_=np.full(nr,np.nan);hi_=np.full(nr,np.nan);mgn=C.get('margin',3.8)
  def look(i):
    pts=R[i,:2]+nm0[i]*offs[:,None];ix=np.clip(np.round((pts[:,0]-gx0)/CELL).astype(int),0,nx-1);iz=np.clip(np.round((pts[:,1]-gz0)/CELL).astype(int),0,nz-1)
    hh=Hh[iz,ix];on=RCm[iz,ix]&(np.abs(hh-R[i,2])<1.3);return on,hh
  for i in range(nr):
    on,hh=look(i);k=None
    for q_ in range(0,7):
      if on[c0+q_]:k=c0+q_;break
      if on[c0-q_]:k=c0-q_;break
    if k is None:continue
    a_=k;b_=k;gap=0
    while a_>0 and (on[a_-1] or (a_>1 and on[a_-2])):a_-=1
    while b_<len(offs)-1 and (on[b_+1] or (b_<len(offs)-2 and on[b_+2])):b_+=1
    lo_[i]=offs[a_];hi_[i]=offs[b_]
  ok_=~np.isnan(lo_)
  if ok_.sum()>10:
    ii=np.arange(nr);lo_=np.interp(ii,ii[ok_],lo_[ok_]);hi_=np.interp(ii,ii[ok_],hi_[ok_])
    lo_=gaussian_filter1d(lo_,3,mode='nearest');hi_=gaussian_filter1d(hi_,3,mode='nearest')
    sh=np.clip((lo_+hi_)/2,-3.5,3.5);wdt=(hi_-lo_)/2
    R[:,:2]+=nm0*sh[:,None]
    hw=np.clip(np.minimum(hw*1.15,np.maximum(wdt,C.get('hwmin',3.4))),C.get('hwmin',3.4),C.get('hwmax',8.0))
    print('recentred: shift pct',np.percentile(np.abs(sh),[50,95,100]).round(1),'half width',np.percentile(hw,[5,50,95]).round(1))
    # wall distance per side: just outside the road, but no further than the margin and never past a drop of more than 1.2 m
    for i in range(nr):
      pts_on,hh=look(i)
      for side,sg in((0,-1),(1,1)):
        base=hw[i]
        wallD=base+mgn
        # drop test along the outward ray from the (shifted) centre
        for q_ in np.arange(base+.5,base+mgn+.01,.5):
          p_=R[i,:2]+nm0[i]*sg*q_;ix=int(np.clip(round((p_[0]-gx0)/CELL),0,nx-1));iz=int(np.clip(round((p_[1]-gz0)/CELL),0,nz-1))
          if Hh[iz,ix]<R[i,2]-1.2:wallD=max(base+.4,q_-.7);break
        WL[side,i]=wallD
    for side in(0,1):WL[side]=gaussian_filter1d(WL[side],1.5,mode='nearest')
    # the loop closure was made from the old line: make it again from the recentred one
    tf=tang(nr-4,nr-1);ts=tang(0,3);out=[R[-1]+np.r_[tf*SP*k,0] for k in range(1,9)]
    bk=[R[0]-np.r_[ts*SP*k,0] for k in range(8,0,-1)]
    a=out[-1];b=bk[0];m=max(2,int(np.hypot(*(b-a)[:2])/SP));ch=[a+(b-a)*(k/m) for k in range(1,m)]
    ext=np.array(out+ch+bk);full=np.r_[R,ext];hwf=np.r_[hw,np.full(len(ext),min(hw[-1],4.5))]
    pts=[[round(p[0],2),round(p[1],2),round(p[2],2),round(w,2)] for p,w in zip(full,hwf)]

# ---- fords: where water covers the road
fords=[]
if C.get('water'):
  Hw=None
  for nm in pick(C['water']):
    vv,ff=Gv(nm);Hw=raster(vv,ff,gx0,gz0,nx,nz,CELL,Hw)
  if Hw is not None:
    gi=lambda p:(np.clip(np.round((p[1]-gz0)/CELL).astype(int),0,nz-1),np.clip(np.round((p[0]-gx0)/CELL).astype(int),0,nx-1))
    iz_,ix_=gi(R[:,:2].T);flood=(~np.isnan(Hw[iz_,ix_]))&(Hw[iz_,ix_]>Hh[iz_,ix_]+.15)
    i=0
    while i<nr:
      if flood[i]:
        j=i
        while j<nr and flood[j]:j+=1
        if j-i>=2:
          c=(i+j)//2;psi=np.arctan2(R[min(c+1,nr-1),0]-R[max(c-1,0),0],R[min(c+1,nr-1),1]-R[max(c-1,0),1])
          fords.append({'x':round(R[c,0],2),'z':round(R[c,1],2),'y':round(R[c,2],2),'yw':round(float(np.nanmedian(Hw[iz_[i:j],ix_[i:j]])),2),'w':round((j-i)*SP/2+4,1),'psi':round(float(psi),4),'L':44})
        i=j
      else:i+=1
  print('fords',len(fords),[(f['x'],f['z'],f['w']) for f in fords])
Hq=np.clip(np.round(Hh/.02),-32767,32767).astype(np.int16);rle=[]
for row in Kc:
  i=0
  while i<len(row):
    j=i
    while j<len(row) and row[j]==row[i] and j-i<255:j+=1
    rle+=[row[i],j-i];i=j
# ---- walls: a corridor along both sides of the route (the stage is the only road you can drive) plus the wall props next to it
segs=[]
if C.get('corridor',1):
  mg=C.get('margin',3.8);PRE=C.get('pre',4);Rl=np.r_[np.array(bk[-PRE:]),R,np.array(out)]
  hwl=np.r_[np.full(PRE,hw[0]),hw,np.full(len(out),hw[-1])];ne=len(Rl);et=cKDTree(Rl[:,:2])
  tg=np.gradient(Rl[:,:2],axis=0);tg/=np.linalg.norm(tg,axis=1)[:,None]+1e-9;nrm=np.c_[-tg[:,1],tg[:,0]]
  WLs={}
  for sg in(-1,1):
    w_=WL[0 if sg<0 else 1];WLs[sg]=np.r_[np.full(PRE,hw[0]+mg),np.where(np.isnan(w_),hw+mg,w_),np.full(len(out),hw[-1]+mg)]
  for sg in(-1,1):
    off=Rl[:,:2]+nrm*sg*WLs[sg][:,None];dd=et.query(off)[0]
    for i in range(ne-1):
      if dd[i]<hwl[i]+mg-1.2 or dd[i+1]<hwl[i+1]+mg-1.2:continue  # inside another leg's corridor (inner side of a hairpin)
      if np.hypot(*(off[i+1]-off[i]))>SP*3:continue
      segs.append([off[i,0],off[i,1],off[i+1,0],off[i+1,1]])
  for k in(0,ne-1):  # seal both ends
    a=Rl[k,:2]+nrm[k]*WLs[1][k];b=Rl[k,:2]-nrm[k]*WLs[-1][k];segs.append([a[0],a[1],b[0],b[1]])
nc=len(segs);print('corridor segs',nc)
pw=[]
for nm in pick(C.get('colliders','^$')):
  vv,ff=Gv(nm)
  for t in vv[ff]:
    p=t[:,[0,2]];e=[(p[0],p[1]),(p[1],p[2]),(p[2],p[0])];a_,b_=max(e,key=lambda q:np.linalg.norm(q[0]-q[1]));L=np.linalg.norm(a_-b_)
    if L<.3:continue
    u_=p[1]-p[0];w_=p[2]-p[0]
    if abs(u_[0]*w_[1]-u_[1]*w_[0])>L*1.0:continue
    if rt.query(p.mean(0))[0]>C.get('wallr',60):continue
    pw.append([a_[0],a_[1],b_[0],b_[1]])
if pw:
  pw=np.unique(np.round(np.array(pw),2),axis=0)
  if C.get('wallsnap'):
    q=C['wallsnap'];pw=np.round(pw/q)*q;pw=pw[np.hypot(pw[:,2]-pw[:,0],pw[:,3]-pw[:,1])>=q*.9];pw=np.unique(pw,axis=0)
  keep=[]
  for sg in pw:
    a_,b_=sg[:2],sg[2:];k=max(2,int(np.linalg.norm(b_-a_)/1.5));t=np.linspace(0,1,k)[:,None];Pp=a_*(1-t)+b_*t;dd,ii=rt.query(Pp);keep.append(not(dd<hw[np.minimum(ii,nr-1)]+.5).any())
  pw=pw[np.array(keep,bool)];segs+=pw.tolist()
print('prop wall segs',len(segs)-nc)
segs=np.round(np.array(segs),2) if segs else np.zeros((0,4))
# ---- start slots: two staggered boxes just behind the first point
t0=tang(0,3);side=np.r_[-t0[1],t0[0]]
slots=[[round(R[0,0]-t0[0]*k*9+side[0]*sg*2.6,2),round(R[0,1]-t0[1]*k*9+side[1]*sg*2.6,2),round(R[0,2],2)] for k,sg in((0,-1),(0,1))]
# road network of the whole map for the stage-select picture: every other skeleton pixel, game metres
kk=np.array(sorted(S_))[::2];net=np.unique(np.round(np.c_[(x0+kk[:,1]*cell)*S,(z0+kk[:,0]*cell)*S]/4).astype(int),axis=0)*4
stage={'net':net.ravel().tolist(),'n':nr,'len':round(float(Lc[-1])),'fin':[round(R[-1,0],2),round(R[-1,1],2)],'start':[round(R[0,0],2),round(R[0,1],2)],'fords':fords,
 'route':[[round(p[0],1),round(p[1],1),round(p[2],1)] for p in R[::2]],'hw':[round(float(h),1) for h in hw[::2]],'corr':nc,'hwMed':round(float(np.median(hw)),2)}
gd={'x0':float(gx0),'z0':float(gz0),'nx':int(nx),'nz':int(nz),'cell':CELL}
json.dump({'S':S,'over':[],'slots':slots,'pts':pts,'grid':gd,'segs':segs.tolist(),'stage':stage},open(W+'/track.json','w'))
Hq.tofile(W+'/hf.i16');np.array(rle,np.uint8).tofile(W+'/cls.rle')
