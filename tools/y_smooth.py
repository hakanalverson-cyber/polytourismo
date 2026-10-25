"""Remove the 0.1 m rounding steps from a track's height profile: light gaussian along the lap (wrap), stored to the centimetre.
At 12 m spacing the rounding made a grade step every sample, which the suspension felt as a constant shake at speed.
usage: y_smooth.py <data.js> [sigma_samples]"""
import json,re,sys,numpy as np
from scipy.ndimage import gaussian_filter1d
f=sys.argv[1];sg=float(sys.argv[2]) if len(sys.argv)>2 else 1.5
s=open(f).read();m=re.search(r'^(.*?=)(\{.*\})(;?\s*)$',s,re.S);h,d,t=m.group(1),json.loads(m.group(2)),m.group(3)
y=np.array([q[2] for q in d['pts']],float);ys=gaussian_filter1d(y,sg,mode='wrap')
print(f'{f}: moved max {np.abs(ys-y).max():.2f} m, mean {np.abs(ys-y).mean():.3f} m')
for i,q in enumerate(d['pts']):q[2]=round(float(ys[i]),2)
open(f,'w').write(h+json.dumps(d,separators=(',',':'))+t)
