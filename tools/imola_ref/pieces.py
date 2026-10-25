# split every object material into connected pieces (shared vertices), record each piece's oriented footprint, height range and colours
import numpy as np,json
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import connected_components
D=np.load('tris.npz');C=np.load('cols.npz')
MATS=['buildings_003','buildings_001','b5_001','paddock_001','garages_001','tower_wall_001','windows_001','garage_spons_001','grilles_001','tower_spons_001','box_wall_001','pit_conc_001','bar_001','soveny_001','houses_add_001',
 'GENERIC_tent_001','Gazebo_Tent_003','Parasol_001','Mobile_Shops_001','GENERIC_Truck_Block_001','Vehicles_001','f40_001',
 'gstand_001','seats_001','gr_seats_001','stand_001','scaffold_001','railing_001','outwalk_001','galvanized_001','StartBridgeStructure_001','Pannello_Skin_00_001','Main_board_001','billboard1_001','metals_003','podium_001','track_bridges_001','bridges_001','top_ext_001']
def minrect(xy):
  from scipy.spatial import ConvexHull
  if len(xy)<3:return xy.mean(0),0.,np.ptp(xy[:,0])+.1,np.ptp(xy[:,1])+.1
  try:h=xy[ConvexHull(xy).vertices]
  except Exception:return xy.mean(0),0.,np.ptp(xy[:,0])+.1,np.ptp(xy[:,1])+.1
  best=None
  for i in range(len(h)):
    e=h[(i+1)%len(h)]-h[i];a=np.arctan2(e[1],e[0]);c,s=np.cos(a),np.sin(a)
    u=h@[c,s];v=h@[-s,c];A=np.ptp(u)*np.ptp(v)
    if best is None or A<best[0]:best=(A,a,u.min(),u.max(),v.min(),v.max())
  A,a,u0,u1,v0,v1=best;c,s=np.cos(a),np.sin(a);uc,vc=(u0+u1)/2,(v0+v1)/2
  return np.array([uc*c-vc*s,uc*s+vc*c]),a,u1-u0,v1-v0
out=[]
for mn in MATS:
  if mn not in D.files:continue
  T=D[mn].astype(np.float64);Cc=C[mn];F=len(T)
  V=np.round(T.reshape(-1,3)*50).astype(np.int64);uv,inv=np.unique(V,axis=0,return_inverse=True);inv=inv.reshape(-1);f=inv.reshape(-1,3)
  r=np.r_[f[:,0],f[:,1]];c=np.r_[f[:,1],f[:,2]];n=len(uv)
  g=coo_matrix((np.ones(len(r)),(r,c)),shape=(n,n));k,lab=connected_components(g,directed=False);fl=lab[f[:,0]]
  for p in range(k):
    m=fl==p;t=T[m];P=t.reshape(-1,3);nrm=np.cross(t[:,1]-t[:,0],t[:,2]-t[:,0]);ar=np.linalg.norm(nrm,axis=1)/2
    if ar.sum()<1e-3:continue
    ctr,a,L,W=minrect(P[:,[0,2]])
    up=np.abs(nrm[:,1])/(2*ar+1e-9)>.7;col=Cc[m].astype(float)
    wc=(col[~up]*ar[~up,None]).sum(0)/max(ar[~up].sum(),1e-9) if (~up).any() else col.mean(0)
    tc=(col[up]*ar[up,None]).sum(0)/max(ar[up].sum(),1e-9) if up.any() else wc
    out.append(dict(m=mn,c=[round(ctr[0],2),round(ctr[1],2)],a=round(float(a),4),L=round(float(L),2),W=round(float(W),2),y0=round(float(P[:,1].min()),2),y1=round(float(P[:,1].max()),2),nt=int(m.sum()),area=round(float(ar.sum()),1),wc=[int(x) for x in wc],tc=[int(x) for x in tc]))
  print(mn,k,flush=True)
json.dump(out,open('pieces.json','w'));print(len(out))
