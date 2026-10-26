# top-down map of chosen meshes (model coords) for inspection
import numpy as np,sys,matplotlib;matplotlib.use('Agg');import matplotlib.pyplot as plt
SP='/tmp/claude-0/-home-claude-polytourismo/4b0e7c59-35bd-554a-8c30-0ab78fa183a0/scratchpad/cimola/'
d=np.load(SP+'raw.npz');plt.figure(figsize=(22,11))
cols=dict(collider='r',track_surface='k',stadium_road='0.6',arch='b',wall_01='m',fence='c',tyres='orange',pitwall='g',houses='y',startlights='r')
for k in sorted(set(x[:-2] for x in d.files if x.endswith('_v'))):
  c=[v for kk,v in cols.items() if kk in k]
  if not c:continue
  v=d[k+'_v'];f=d[k+'_f'];
  if len(f)>20000: f=f[::max(1,len(f)//20000)]
  plt.triplot(v[:,0],v[:,2],f,color=c[0],lw=.25)
plt.gca().set_aspect('equal');plt.xlim(-20000,20000);plt.ylim(-9000,9500);plt.gca().invert_yaxis();plt.savefig(SP+'top.png',dpi=60,bbox_inches='tight')
