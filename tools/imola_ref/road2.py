import numpy as np,json
from scipy.spatial import cKDTree
from scipy.ndimage import median_filter,gaussian_filter1d
D=np.load('tris.npz');wl=D['white_line_001'];c=wl.mean(1)
# densify: sample points on each triangle
r=np.random.default_rng(1);pts=[]
for k in range(6):
  a,b=r.random((2,len(wl),1));m=a+b>1;a[m]=1-a[m];b[m]=1-b[m];pts.append(wl[:,0]+(wl[:,1]-wl[:,0])*a+(wl[:,2]-wl[:,0])*b)
pts=np.vstack(pts)[:,[0,2]];tr=cKDTree(pts)
src=open('/home/claude/polytourismo/src/layers/'+('imola_data.js')).read()
d=json.loads(src[src.index('{'):src.rindex('}')+1]);P=np.array(d['pts'],float);n=len(P)
for it in range(2):
  t=np.roll(P[:,:2],-1,0)-np.roll(P[:,:2],1,0);t/=np.linalg.norm(t,axis=1)[:,None];nrm=np.c_[-t[:,1],t[:,0]]
  mid=np.full(n,np.nan);w=np.full(n,np.nan)
  for i in range(n):
    ids=tr.query_ball_point(P[i,:2],14);q=pts[ids]-P[i,:2];al=q@t[i];l=q@nrm[i];m=np.abs(al)<3;l=l[m]
    Lp=l[(l>2)&(l<11)];Rp=l[(l<-2)&(l>-11)]
    if len(Lp)>5 and len(Rp)>5:
      # the inner edge of each line cluster (nearest the road centre)
      lo=np.percentile(Lp,10);ro=np.percentile(Rp,90)
      if 8<lo-ro<17:mid[i]=(lo+ro)/2;w[i]=(lo-ro)/2+.3
  bad=np.isnan(mid);print('it',it,'missing',bad.sum())
  idx=np.arange(n)
  for a in(mid,w):a[bad]=np.interp(idx[bad],idx[~bad],a[~bad],period=n)
  mid=gaussian_filter1d(median_filter(mid,5,mode='wrap'),1.2,mode='wrap');w=gaussian_filter1d(median_filter(w,7,mode='wrap'),2,mode='wrap')
  print('shift',np.percentile(np.abs(mid),[50,90,99,100]).round(2),'w',np.percentile(w,[1,50,99]).round(2))
  P[:,:2]+=nrm*mid[:,None];P[:,3]=np.round(w,2)
d['pts']=[[round(a,2),round(b,2),round(c,2),round(e,2)] for a,b,c,e in P]
open('imola_data_new.js','w').write(src[:src.index('{')]+json.dumps(d,separators=(',',':'))+src[src.rindex('}')+1:])
# straightness report: heading change per point
h=np.unwrap(np.arctan2(np.roll(P[:,1],-1)-P[:,1],np.roll(P[:,0],-1)-P[:,0]));dh=np.diff(h)
print('|dh| pct',np.percentile(np.abs(dh),[50,75,90]).round(4))
