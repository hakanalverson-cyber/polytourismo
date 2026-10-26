import numpy as np,json,matplotlib;matplotlib.use('Agg');import matplotlib.pyplot as plt
SP='/tmp/claude-0/-home-claude-polytourismo/4b0e7c59-35bd-554a-8c30-0ab78fa183a0/scratchpad/cimola/'
J=json.load(open(SP+'track.json'));g=J['grid'];r=np.fromfile(SP+'cls.rle',np.uint8).reshape(-1,2)
K=np.repeat(r[:,0],r[:,1]).reshape(g['nz'],g['nx'])
plt.figure(figsize=(22,11));plt.imshow(K,extent=[g['x0'],g['x0']+g['nx']*g['cell'],g['z0']+g['nz']*g['cell'],g['z0']],cmap='tab10',vmax=9,interpolation='nearest')
p=np.array(J['pts']);plt.plot(p[:,0],p[:,1],'w-',lw=.6)
for i in range(0,len(p),25):plt.text(p[i,0],p[i,1],str(i),color='k',fontsize=9)
for s in J['segs']:plt.plot([s[0],s[2]],[s[1],s[3]],'r-',lw=.7)
plt.savefig(SP+'chk.png',dpi=60,bbox_inches='tight')
