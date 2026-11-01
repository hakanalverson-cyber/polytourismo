import sys,json,numpy as np
OUT=sys.argv[1]; m=json.load(open(OUT+'.json')); b=open(OUT+'.bin','rb').read()
GN=m['gn']; H=np.frombuffer(b,np.int16,GN*GN,m['goff']).reshape(GN,GN)/8.
st=2; Hs=H[::st,::st]; U=np.frombuffer(b,np.uint8,GN*GN,m['uoff']).reshape(GN,GN)[::st,::st]/255.; n=Hs.shape[0]; gc=m['gc']*st
X,Z=np.meshgrid(np.arange(n)*gc,np.arange(n)*gc)
V=np.stack([X,Hs,Z],-1).reshape(-1,3)
i=np.arange(n-1); I,J=np.meshgrid(i,i); a=(J*n+I).ravel(); bb=a+1; c=a+n; d=c+1
F=np.concatenate([np.stack([a,c,bb],1),np.stack([bb,c,d],1)])
T=V[F]; cy=T[:,:,1].mean(1); uu=np.concatenate([U[:-1,:-1].ravel(),U[:-1,:-1].ravel()])
keep=T[:,:,1].max(1)>-3
T=T[keep]; cy=cy[keep]; uu=uu[keep]
nrm=np.cross(T[:,1]-T[:,0],T[:,2]-T[:,0]); ny=np.abs(nrm[:,1])/(np.linalg.norm(nrm,axis=1)+1e-9)
g=np.array([.42,.6,.28]); dry=np.array([.62,.6,.36]); sand=np.array([.86,.8,.6]); rock=np.array([.55,.52,.46])
t=np.clip(cy/300,0,1)[:,None]; col=g*(1-t)+dry*t
pave=np.array([.74,.71,.66]); col=col*(1-uu[:,None])+pave*uu[:,None]; col=np.where((cy<3)[:,None],sand,col); col=np.where((ny<.75)[:,None],rock,col)
pos=np.fromfile(OUT+'_prev.pos',np.float32); cc=np.fromfile(OUT+'_prev.col',np.uint8)
np.concatenate([pos,T.astype(np.float32).ravel()]).tofile(OUT+'_prevg.pos'); np.concatenate([cc,np.repeat((col*255).astype(np.uint8),3,0).ravel()]).tofile(OUT+'_prevg.col')
print('ground tris',len(T))
