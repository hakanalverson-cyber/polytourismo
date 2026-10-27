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
def cones():
  # traffic cones (one prop shape inside a merged prop mesh) close the side roads the lap must not take
  cn=cc.get('cones')
  if not cn:return np.zeros((0,3))
  from scipy.sparse.csgraph import connected_components
  from scipy.sparse import coo_matrix
  out=[]
  for n in pick(cn['mesh']):
    v=d[n+'_v'].astype(np.float64);f=d[n+'_f'];_,inv=np.unique(np.round(v,4),axis=0,return_inverse=True);inv=inv.ravel();ff=inv[f];m=inv.max()+1
    _,lab=connected_components(coo_matrix((np.ones(len(ff)*2),(np.r_[ff[:,0],ff[:,1]],np.r_[ff[:,1],ff[:,2]])),shape=(m,m)),directed=False);lv=lab[inv]
    for c in np.unique(lv):
      q=v[lv==c]
      if len(q)==cn['nverts'] and np.allclose(q.max(0)-q.min(0),cn['ext'],rtol=.1):out.append(q.mean(0))
  print('cones',len(out));return np.array(out).reshape(-1,3)
def gates(M,x0,z0,cell):
  # a cone group becomes a solid bar across the road (extended past the outer cones), a lone cone a disc
  P=cones();zz,xx=np.mgrid[0:M.shape[0],0:M.shape[1]];X=x0+xx*cell;Z=z0+zz*cell;M=M.copy()
  for bx,bz,br in cc.get('block',[]):M[np.hypot(X-bx,Z-bz)<br]=False  # hand-placed closures (model units) where no cones stand
  if not len(P):return M
  D=np.mean(cc['cones']['ext'][::2]);xz=P[:,[0,2]];left=set(range(len(xz)))
  while left:
    g=[left.pop()];k=0
    while k<len(g):
      nb=[j for j in left if np.hypot(*(xz[j]-xz[g[k]]))<cc['cones'].get('link',14)*D];[left.discard(j) for j in nb];g+=nb;k+=1
    q=xz[g];c=q.mean(0)
    if len(q)>1:
      u=np.linalg.svd(q-c)[2][0];t=(q-c)@u;a,b=t.min()-6*D,t.max()+6*D
      tt=np.clip((X-c[0])*u[0]+(Z-c[1])*u[1],a,b);dist=np.hypot(X-(c[0]+tt*u[0]),Z-(c[1]+tt*u[1]))
    else:dist=np.hypot(X-c[0],Z-c[1])
    M[dist<(.8*D if len(q)>1 else 4*D)]=False
  return M
def ring(M,H,x0,z0,cell):
  from skimage.morphology import skeletonize
  from scipy.ndimage import distance_transform_edt,convolve
  dt=distance_transform_edt(M);K=skeletonize(M);k3=np.ones((3,3));k3[1,1]=0
  while True:  # strip dead ends (cut-off side roads, run-off stubs) until only loops remain
    nb=convolve(K.astype(int),k3.astype(int),mode='constant');e=K&(nb<=1)
    if not e.any():break
    K[e]=False
  np.save(C['work']+'/ringK.npy',K);np.save(C['work']+'/ringM.npy',M)
  ys,xs=np.nonzero(K);print('ring pixels',len(ys),'junctions',int((K&(convolve(K.astype(int),k3.astype(int),mode='constant')>2)).sum()))
  # order the loop: shortest path to the far side, then back the other way without reusing those pixels
  import networkx as nx
  P_=list(zip(ys.tolist(),xs.tolist()));S_=set(P_);G=nx.Graph()
  for p in P_:
    for a,b in((0,1),(1,0),(1,1),(1,-1)):
      q=(p[0]+a,p[1]+b)
      if q in S_:G.add_edge(p,q,weight=np.hypot(a,b))
  G=G.subgraph(max(nx.connected_components(G),key=len)).copy();a0=next(iter(G.nodes))
  dist=nx.single_source_dijkstra_path_length(G,a0);b0=max(dist,key=dist.get)
  p1=nx.dijkstra_path(G,a0,b0);H2=G.copy();H2.remove_nodes_from(p1[1:-1]);p2=nx.dijkstra_path(H2,b0,a0)
  path=p1+p2[1:-1];print('loop pixels',len(path),'of',len(S_))
  pa=np.array(path,float);w=dt[pa[:,0].astype(int),pa[:,1].astype(int)]*2*cell
  Hf=np.where(np.isnan(H),np.nanmean(H),H);hy=Hf[pa[:,0].astype(int),pa[:,1].astype(int)]
  pa=pa[::8];w=w[::8];hy=hy[::8]
  return np.c_[x0+pa[:,1]*cell,hy,z0+pa[:,0]*cell],w
def skeleton(v,f):
  # the road mask is a ring: walk its outer contour, pair each point with the nearest point of the inner contour
  from skimage import measure
  cell=cc.get('cell',.25);x0,z0=v[:,[0,2]].min(0)-4*cell;nx,nz=(np.ceil((v[:,[0,2]].max(0)-[x0,z0])/cell)+8).astype(int)
  H=raster(v,f,x0,z0,nx,nz,cell);M=~np.isnan(H);M=ndimage.binary_closing(M,iterations=3);M=ndimage.binary_opening(M,iterations=2)
  M=gates(M,x0,z0,cell);lab,nl=ndimage.label(M);M=lab==np.argmax(np.bincount(lab.ravel())[1:])+1
  if cc.get('prune'):return ring(M,H,x0,z0,cell)
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
# ---- grid boxes: one painted box per car, front row first
slots=[]
if st.get('boxes'):
  from scipy.sparse.csgraph import connected_components
  from scipy.sparse import coo_matrix
  for nm in pick(st['boxes']):
    v=d[nm+'_v'].astype(np.float64)*S;f=d[nm+'_f'];_,inv=np.unique(np.round(v,3),axis=0,return_inverse=True);inv=inv.ravel();ff=inv[f];m=inv.max()+1
    _,lab=connected_components(coo_matrix((np.ones(len(ff)*2),(np.r_[ff[:,0],ff[:,1]],np.r_[ff[:,1],ff[:,2]])),shape=(m,m)),directed=False);lv=lab[inv]
    for c in np.unique(lv):
      q=v[lv==c];e=sorted(np.ptp(q[:,[0,2]],0))
      bx=st.get('boxsize',[1.2,7,5,9])
      if st.get('debug'):print('comp',[round(x,1) for x in e])
      if bx[0]<e[0]<bx[1] and bx[2]<e[1]<bx[3]:slots.append(q.mean(0))
  if slots:
    sl=np.array(slots);_,ii=cKDTree(R[:,[0,2]]).query(sl[:,[0,2]]);rel=(ii+len(R)//2)%len(R)  # boxes behind the start line sit near the end of the lap
    if st.get('cluster'):
      # keep the biggest run of boxes (gaps under 40 m: a second grid elsewhere is dropped) and start the lap just past its front box
      o=np.argsort(rel);rr=rel[o];runs=[[o[0]]]
      for k_ in range(1,len(o)):
        (runs[-1].append(o[k_]) if (rr[k_]-rr[k_-1])*8<40 else runs.append([o[k_]]))
      g=max(runs,key=len);sl=sl[g];ii=ii[g];rel=rel[g];front=ii[np.argmax(rel)];sh=(front+int(round(st.get('ahead',8)/8)))%len(R)
      R=np.roll(R,-sh,0);Wr=np.roll(Wr,-sh);_,ii=cKDTree(R[:,[0,2]]).query(sl[:,[0,2]]);rel=(ii+len(R)//2)%len(R);print('grid run',len(g),'start moved',sh)
    o=np.argsort(-rel);slots=[[round(a[0],2),round(a[2],2),round(a[1],2)] for a in sl[o]]
  print('grid boxes',len(slots))
for sx,sz,sr,it in cc.get('resmooth',[]):  # extra smoothing where the centreline kinks (a closed junction leaves a cusp), game metres
  w=np.clip(1.5-np.hypot(R[:,0]-sx,R[:,2]-sz)/sr,0,1)[:,None]  # full strength in the middle, fading out to the edge
  for _ in range(it):o=(np.roll(R,1,0)+2*R+np.roll(R,-1,0))/4;R=R+w*(o-R)
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
  v,f,_=G(nm);v=v+[0,lift,0]
  if cl==1 and C.get('roadmax'):
    # narrow raised kerbs modelled in the road mesh fall between grid points: sample the asphalt finer and keep the highest point around
    # each grid point, so the car rides up onto them instead of sinking in
    k_=int(C['roadmax']);hf=raster(v,f,x0,z0,nx*k_,nz*k_,CELL/k_);hm=np.where(np.isnan(hf),-1e9,hf);hm=ndimage.maximum_filter(hm,size=k_+1,mode='nearest')[::k_,::k_][:nz,:nx]
    h=np.where(hm<-1e8,np.nan,hm)
  else:h=raster(v,f,x0,z0,nx,nz,CELL)
  ok=~np.isnan(h);unset=H<-1e8
  if rockpat and re.search(rockpat,nm):m=ok&unset;RK|=m
  elif cl==1:m=ok  # the circuit's own asphalt always wins (bridges cross over it and under it)
  else:m=ok&(unset|RK|((h>=H-.02)&(h<=H+2.5)));RK&=~m
  H[m]=h[m];K[m]=cl
# ---- kerbs drawn as their own mesh over the asphalt (the Hungaroring's): the asphalt layer runs on under them and always won, so the
# raised kerbs sank into the road. They go on top here wherever they sit up to 0.8 m above what is there
for pat,lift in C.get('kerbs',[]):
  for nm in pick(pat):
    v,f,_=G(nm);v=v+[0,lift,0];h=raster(v,f,x0,z0,nx,nz,CELL);m=~np.isnan(h)&(H>-1e8)&(h>H-.02)&(h<H+.8);H[m]=h[m];K[m]=2
    print('kerb cells',nm,int(m.sum()))
# ---- two-level road (Suzuka's figure of eight crosses itself on a bridge): where the circuit asphalt exists at two heights more than 3 m
# apart, the grid keeps the lower road and a sparse list holds the upper one; the game picks the level nearest the car
UP=None
if C.get('twolevel'):
  lo=np.full((nz,nx),np.nan);hi=np.full((nz,nx),np.nan)
  for nm,cl,lift in layers:
    if cl!=1:continue
    v,f,_=G(nm);v=v+[0,lift,0];raster(v,f,x0,z0,nx,nz,CELL,lo,top=False);raster(v,f,x0,z0,nx,nz,CELL,hi,top=True)
  two=(hi-lo>3)&~np.isnan(lo);two=ndimage.binary_dilation(two,iterations=1)&~np.isnan(lo)&(hi-lo>1)
  H[two]=lo[two];K[two]=1;iz_,ix_=np.nonzero(two)
  UP=np.c_[iz_*nx+ix_,np.round(hi[two]/.02)].astype(np.int32);print('two-level cells',len(UP))
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
if C.get('wallsnap') and len(segs):  # dense props (tyre stacks, fences): ends snapped to a coarse grid, so thousands of small faces become a few walls
  q=C['wallsnap'];segs=np.round(segs/q)*q;segs=segs[np.hypot(segs[:,2]-segs[:,0],segs[:,3]-segs[:,1])>=q*.9]
  a=segs[:,:2].copy();b=segs[:,2:].copy();sw=(a[:,0]>b[:,0])|((a[:,0]==b[:,0])&(a[:,1]>b[:,1]));segs=np.where(sw[:,None],np.c_[b,a],np.c_[a,b]);segs=np.unique(segs,axis=0);print('snapped wall segs',len(segs))
tree=cKDTree(R[:,[0,2]]);keep=[]
for sg in segs:
  a,b=sg[:2],sg[2:];k=max(2,int(np.linalg.norm(b-a)/1.5));t=np.linspace(0,1,k)[:,None];Pp=a*(1-t)+b*t;dd,ii=tree.query(Pp);keep.append(not(dd<Wr[ii]/2+.5).any())
segs=segs[np.array(keep,bool)] if len(segs) else segs;print('wall segs',len(segs))
# ---- overhead: stretches of the lap with a structure above the road (bridge decks, footbridges): the game uses these for the hood camera
over=[]
if C.get('overhead'):
  Lr=np.r_[0,np.cumsum(np.linalg.norm(np.diff(np.r_[R,R[:1]][:,[0,2]],axis=0),axis=1))];sf=np.arange(0,Lr[-1],1.)
  Rf=np.c_[[np.interp(sf,Lr,np.r_[R,R[:1]][:,j]) for j in range(3)]].T;Wf=np.interp(sf,Lr,np.r_[Wr,Wr[:1]])
  ft=cKDTree(Rf[:,[0,2]]);tris=[]
  for nm in names:
    if re.search(C['overhead'],nm):continue
    v,f,_=G(nm);t=v[f];c_=t.mean(1);rr=np.linalg.norm(t[:,:,[0,2]]-c_[:,None,[0,2]],axis=2).max(1);dd,ii=ft.query(c_[:,[0,2]]);y0=Rf[ii,1];lo=t[:,:,1].min(1)
    k=(dd<Wf[ii]/2+rr)&(lo>y0+3)&(lo<y0+30)  # reaching over the road and hanging above it, not standing on the ground
    if k.any():tris.append(t[k])
  T3=np.concatenate(tris) if tris else np.zeros((0,3,3));print('overhead tris',len(T3))
  gx0,gz0=Rf[:,[0,2]].min(0)-60;gnx,gnz=(np.ceil(Rf[:,[0,2]].max(0)-[gx0,gz0])+120).astype(int)
  OV=~np.isnan(raster(T3.reshape(-1,3),np.arange(len(T3)*3).reshape(-1,3),gx0,gz0,gnx,gnz,1.)) if len(T3) else np.zeros((gnz,gnx),bool)
  flag=np.zeros(len(Rf),bool)
  for i,(p,w) in enumerate(zip(Rf,Wf)):
    dirv=Rf[(i+1)%len(Rf)]-p;nrm=np.array([-dirv[2],dirv[0]]);nrm/=np.linalg.norm(nrm)+1e-9
    for lat in(-.4,0,.4):
      q=p[[0,2]]+nrm*lat*w;ix,iz=int(round(q[0]-gx0)),int(round(q[1]-gz0))
      if 0<=ix<gnx and 0<=iz<gnz and OV[iz,ix]:flag[i]=True;break
  # runs shorter than 5 m (gantries, cables, overhanging signs) do not count
  k=0
  while k<len(flag):
    if flag[k]:
      e=k
      while e<len(flag) and flag[e]:e+=1
      if e-k>=C.get('overmin',5):over.append([round(sf[k],1),round(sf[e-1],1)])
      k=e
    else:k+=1
  print('overhead',over)
import base64
gd={'x0':x0,'z0':z0,'nx':nx,'nz':nz,'cell':CELL}
if UP is not None:gd['up']=base64.b64encode(UP.tobytes()).decode()
json.dump({'S':S,'over':over,'slots':slots,'pts':pts,'grid':gd,'segs':np.round(segs,2).tolist()},open(W+'/track.json','w'))
Hq.tofile(W+'/hf.i16');np.array(rle,np.uint8).tofile(W+'/cls.rle')
