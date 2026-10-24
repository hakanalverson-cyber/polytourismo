"""Ease DEM artefacts (bridges, cuttings, tree-top bias) where the sampled grade exceeds the published maximum:
Nordschleife up 18 %, down 11 % (de.wikipedia Nordschleife). Only the offending stretches are smoothed; heights elsewhere stay as sampled."""
import json,re,sys,numpy as np
from scipy.ndimage import gaussian_filter1d,binary_dilation
f,up,dn=sys.argv[1],float(sys.argv[2]),float(sys.argv[3])
s=open(f).read();m=re.search(r'^(.*?=)(\{.*\})(;?\s*)$',s,re.S);h,d,t=m.group(1),json.loads(m.group(2)),m.group(3)
p=np.array(d['pts']);n=len(p);step=np.hypot(*np.diff(np.vstack([p[:,:2],p[:1,:2]]),axis=0).T)
y=p[:,2].copy()
for it in range(3000):
    g=np.diff(np.r_[y,y[:1]])/step;bad=(g>up)|(g<-dn)
    if not bad.any():break
    w=binary_dilation(bad,iterations=3);ys=gaussian_filter1d(y,1.5,mode='wrap');y=np.where(w,ys,y)
g=np.diff(np.r_[y,y[:1]])/step
print(f'{f}: {it} passes, max up {g.max()*100:.1f}%, max down {-g.min()*100:.1f}%, relief {y.max()-y.min():.0f} m, moved max {np.abs(y-p[:,2]).max():.1f} m')
for i,q in enumerate(d['pts']):q[2]=round(float(y[i]),1)
open(f,'w').write(h+json.dumps(d,separators=(',',':'))+t)
