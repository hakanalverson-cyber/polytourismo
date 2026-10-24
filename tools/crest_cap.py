"""Soften crests and dips the game's grip model can't take at racing speed: vertical curvature is capped at |k| (1/m),
smoothing only the offending stretches. At 45 m/s a crest of k=0.002 already halves the tyre load; real cars cope, the AI doesn't.
usage: crest_cap.py <data.js> <k> [k_crest]  (crests, k<0, can take a tighter cap than dips)"""
import json,re,sys,numpy as np
from scipy.ndimage import gaussian_filter1d,binary_dilation
f,cap=sys.argv[1],float(sys.argv[2]);ccap=float(sys.argv[3]) if len(sys.argv)>3 else cap
s=open(f).read();m=re.search(r'^(.*?=)(\{.*\})(;?\s*)$',s,re.S);h,d,t=m.group(1),json.loads(m.group(2)),m.group(3)
p=np.array(d['pts']);n=len(p);step=np.hypot(*np.diff(np.vstack([p[:,:2],p[:1,:2]]),axis=0).T)
y=p[:,2].copy()
def curv(y):
    g=np.diff(np.r_[y,y[:1]])/step;return (g-np.roll(g,1))/((step+np.roll(step,1))/2)
for it in range(5000):
    k=curv(y);bad=(k>cap)|(k<-ccap)
    if not bad.any():break
    w=binary_dilation(bad,iterations=2);ys=gaussian_filter1d(y,1.2,mode='wrap');y=np.where(w,ys,y)
k=curv(y)
print(f'{f}: {it} passes, max dip {k.max():.4f} crest {-k.min():.4f}, relief {y.max()-y.min():.0f} m, moved max {np.abs(y-p[:,2]).max():.1f} m')
for i,q in enumerate(d['pts']):q[2]=round(float(y[i]),1)
open(f,'w').write(h+json.dumps(d,separators=(',',':'))+t)
