import numpy as np,json,matplotlib;matplotlib.use('Agg');import matplotlib.pyplot as plt
SP='/tmp/claude-0/-home-claude-polytourismo/4b0e7c59-35bd-554a-8c30-0ab78fa183a0/scratchpad/cimola/'
d=np.load(SP+'raw.npz');F=json.load(open('fit.json'));R=np.array(F['R']);
def X(v):q=v[:,[0,2]]*np.array([1,F['mir']]);return (F['s']*(R@q.T)).T+F['t']
s=open('../../src/layers/imola_data.js').read();p=np.array(json.loads(s[s.index('{'):s.rindex('}')+1])['pts'])
plt.figure(figsize=(20,11))
for k,c in [('imola_track_surface_road_imola_0','k'),('imola_stadium_road_imola_0','0.6')]:
  v=X(d[k+'_v']);f=d[k+'_f'];plt.triplot(v[:,0],v[:,1],f,color=c,lw=.2)
plt.plot(p[:,0],p[:,1],'r-',lw=.8);
for i in range(0,len(p),20):plt.text(p[i,0],p[i,1],str(i),color='b',fontsize=8)
plt.gca().set_aspect('equal');plt.gca().invert_yaxis();plt.savefig(SP+'ov.png',dpi=70,bbox_inches='tight')
