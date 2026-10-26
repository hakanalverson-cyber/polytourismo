import numpy as np
def raster(v,f,x0,z0,nx,nz,cell,H=None,top=True):
  if H is None:H=np.full((nz,nx),np.nan)
  for t in v[f]:
    a,b,c=t[:,[0,2]];mn=np.floor((np.minimum(np.minimum(a,b),c)-[x0,z0])/cell).astype(int);mx=np.ceil((np.maximum(np.maximum(a,b),c)-[x0,z0])/cell).astype(int)
    mn=np.maximum(mn,0);mx=np.minimum(mx,[nx-1,nz-1])
    if (mx<mn).any():continue
    gx,gz=np.meshgrid(np.arange(mn[0],mx[0]+1),np.arange(mn[1],mx[1]+1));px=x0+gx*cell;pz=z0+gz*cell
    d0=b-a;d1=c-a;den=d0[0]*d1[1]-d0[1]*d1[0]
    if abs(den)<1e-9:continue
    wx=px-a[0];wz=pz-a[1];l1=(wx*d1[1]-wz*d1[0])/den;l2=(d0[0]*wz-d0[1]*wx)/den;l0=1-l1-l2;m=(l0>=-1e-3)&(l1>=-1e-3)&(l2>=-1e-3)
    if not m.any():continue
    h=(l0*t[0,1]+l1*t[1,1]+l2*t[2,1])[m];gz_,gx_=gz[m],gx[m];cur=H[gz_,gx_]
    H[gz_,gx_]=np.where(np.isnan(cur),h,np.fmax(cur,h) if top else np.fmin(cur,h))
  return H
