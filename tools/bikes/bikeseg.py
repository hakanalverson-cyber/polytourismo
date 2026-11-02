import sys,json,numpy as np
from scipy import sparse
from scipy.sparse.csgraph import connected_components
def comps(tri):
  v=np.round(tri.reshape(-1,3)*1e5).astype(np.int64);_,inv=np.unique(v,axis=0,return_inverse=True);inv=inv.ravel()
  nf=len(tri);f=np.repeat(np.arange(nf),3);A=sparse.coo_matrix((np.ones(len(inv)),(f,inv))).tocsr();M=A@A.T
  n,lab=connected_components(M,directed=False);return n,lab
def segment(tri,rake=25,ov={}):
  P=tri.reshape(-1,3);mn,mx=P.min(0),P.max(0)
  cx=(mn[0]+mx[0])/2
  tri=tri-np.array([cx,mn[1],(mn[2]+mx[2])/2]);P=tri.reshape(-1,3)
  n,lab=comps(tri)
  cb=[None]*n
  fmin=np.zeros((n,3))+1e9;fmax=np.zeros((n,3))-1e9
  vmin=tri.min(1);vmax=tri.max(1)
  np.minimum.at(fmin,lab,vmin);np.maximum.at(fmax,lab,vmax)
  low=P[P[:,1]<.012];zs=np.sort(low[:,2]);gap=np.argmax(np.diff(zs));zr,zf=zs[:gap+1].mean(),zs[gap+1:].mean() # zf: larger z = front
  out={}
  part=np.zeros(len(tri),int) # 0 body 1 steer 2 fw 3 rw
  ccen=(fmin+fmax)/2;csz=fmax-fmin
  W={}
  for key,zc,pi in (('fw',zf,2),('rw',zr,3)):
    # tyre component: contains lowest verts near zc
    cand=np.where((fmin[:,1]<.012)&(np.abs(ccen[:,2]-zc)<.08))[0]
    t=cand[np.argmax(csz[cand,1])]
    r=(fmax[t,1]-fmin[t,1])/2;c=np.array([0,fmin[t,1]+r,(fmin[t,2]+fmax[t,2])/2]);W[key]=(c,r)
    inside=(np.abs(ccen[:,2]-c[2])+csz[:,2]/2<=r*1.04)&(np.abs(ccen[:,1]-c[1])+csz[:,1]/2<=r*1.04)&(csz[:,0]<.2)
    cent=(np.hypot(ccen[:,2]-c[2],ccen[:,1]-c[1])<.22*r)|((csz[:,1]>1.2*r)&(csz[:,2]>1.2*r))
    inside&=cent
    for ci in np.where(inside)[0]: part[lab==ci]=pi
  # steering: in front of the steering axis through the front axle
  c,r=W['fw'];a=np.radians(ov.get('rake',rake));dz,dy=-np.sin(a),np.cos(a)  # axis dir (back, up)
  off=ov.get('off',0.0)
  sd=lambda z,y:((z-c[2])*dy-(y-c[1])*dz)-off  # >0 in front
  L=mx[2]-mn[2]
  dist=sd(ccen[:,2],ccen[:,1])
  st=(dist>ov.get('thr',-.05))&(ccen[:,1]>c[1]+ov.get('ymin',0))&(np.linalg.norm(csz,axis=1)<ov.get('big',.45)*L)
  for bx in ov.get('box',[]):  # extra boxes [z0,z1,y0,y1] (bike coords): components whose centre falls inside are steering
    st|=(ccen[:,2]>bx[0])&(ccen[:,2]<bx[1])&(ccen[:,1]>bx[2])&(ccen[:,1]<bx[3])
  for bx in ov.get('nobox',[]):
    st&=~((ccen[:,2]>bx[0])&(ccen[:,2]<bx[1])&(ccen[:,1]>bx[2])&(ccen[:,1]<bx[3]))
  for ci in np.where(st)[0]:
    if part[np.where(lab==ci)[0][0]]==0: part[lab==ci]=1
  # steering pivot: point on the axis at the height of the top of the steering parts
  sp=part==1
  ytop=tri[sp].reshape(-1,3)[:,1].max() if sp.any() else c[1]+.5
  piv=np.array([0,ytop,c[2]+(ytop-c[1])*dz/dy+off*0])
  return tri,part,dict(fw=[W['fw'][0].tolist(),W['fw'][1]],rw=[W['rw'][0].tolist(),W['rw'][1]],axis=[dz,dy],piv=piv.tolist(),len=float(L),h=float(mx[1]-mn[1]))
