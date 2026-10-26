# similarity fit (rotation, uniform scale, translation, optional mirror) of the model road edges onto our Imola edge lines
import numpy as np,json,sys
from scipy.spatial import cKDTree
SP='/tmp/claude-0/-home-claude-polytourismo/4b0e7c59-35bd-554a-8c30-0ab78fa183a0/scratchpad/cimola/'
d=np.load(SP+'raw.npz');v=d['imola_track_surface_road_imola_0_v'];f=d['imola_track_surface_road_imola_0_f']
e=np.sort(np.r_[f[:,[0,1]],f[:,[1,2]],f[:,[2,0]]],1);u,c=np.unique(e,axis=0,return_counts=True);b=u[c==1]
A=v[b[:,0]][:,[0,2]];B=v[b[:,1]][:,[0,2]];t=np.linspace(0,1,8)[:,None,None];M=(A[None]*(1-t)+B[None]*t).reshape(-1,2)
s=open('../../src/layers/imola_data.js').read();p=np.array(json.loads(s[s.index('{'):s.rindex('}')+1])['pts'])
P=p[:,:2];tg=np.roll(P,-1,0)-np.roll(P,1,0);tg/=np.linalg.norm(tg,axis=1)[:,None];nrm=np.c_[-tg[:,1],tg[:,0]]
def dense(Q):
  out=[];n=len(Q)
  for i in range(n):
    a,b2=Q[i],Q[(i+1)%n];k=max(1,int(np.linalg.norm(b2-a)/2));out.append(a+(b2-a)*np.arange(k)[:,None]/k)
  return np.concatenate(out)
E2=np.r_[dense(P+nrm*p[:,3:4]),dense(P-nrm*p[:,3:4])]
tree=cKDTree(E2)
def umey(X,Y):  # Y ~ s R X + t
  mx,my=X.mean(0),Y.mean(0);Xc,Yc=X-mx,Y-my;C=Yc.T@Xc/len(X);U,S,Vt=np.linalg.svd(C);D=np.eye(2)
  if np.linalg.det(U@Vt)<0:D[1,1]=-1
  R=U@D@Vt;sc=np.trace(np.diag(S)@D)/Xc.var(0).sum();return sc,R,my-sc*R@mx
best=None
for mir in (1,-1):
  M0=M*np.array([1,mir])
  for a0 in np.radians(np.arange(0,360,15)):
    R=np.array([[np.cos(a0),-np.sin(a0)],[np.sin(a0),np.cos(a0)]]);sc=np.sqrt(E2.var(0).sum()/M0.var(0).sum());t=E2.mean(0)-sc*R@M0.mean(0)
    for it in range(60):
      Y=(sc*(R@M0.T)).T+t;dd,ii=tree.query(Y);keep=dd<np.percentile(dd,90)
      sc,R,t=umey(M0[keep],E2[ii[keep]])
    Y=(sc*(R@M0.T)).T+t;dd,_=tree.query(Y);m=np.median(dd)
    if best is None or m<best[0]:best=(m,mir,sc,R,t,np.percentile(dd,90))
m,mir,sc,R,t,p90=best;print('median',m,'p90',p90,'mirror',mir,'scale',sc,'ang',np.degrees(np.arctan2(R[1,0],R[0,0])))
json.dump({'mir':mir,'s':sc,'R':R.tolist(),'t':t.tolist()},open('fit.json','w'))
