import numpy as np,json,sys,matplotlib;matplotlib.use('Agg');import matplotlib.pyplot as plt
W=json.load(open(sys.argv[1]))['work'];J=json.load(open(W+'/track.json'));g=J['grid'];r=np.fromfile(W+'/cls.rle',np.uint8).reshape(-1,2)
K=np.repeat(r[:,0],r[:,1]).reshape(g['nz'],g['nx'])
plt.figure(figsize=(12,18));plt.imshow(K,extent=[g['x0'],g['x0']+g['nx']*g['cell'],g['z0']+g['nz']*g['cell'],g['z0']],cmap='tab10',vmax=9,interpolation='nearest')
p=np.array(J['pts']);plt.plot(p[:,0],p[:,1],'w-',lw=.8);plt.plot(p[0,0],p[0,1],'ko',ms=8)
for i in range(0,len(p),20):plt.text(p[i,0],p[i,1],str(i),color='k',fontsize=10)
for s in J['segs']:plt.plot([s[0],s[2]],[s[1],s[3]],'r-',lw=.5)
plt.savefig(W+'/chk.png',dpi=45,bbox_inches='tight')
