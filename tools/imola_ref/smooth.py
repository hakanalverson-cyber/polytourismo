# tidy the measured spans: per object group and layer, cells whose tops (and bottoms) chain within one step form one level region;
# each region takes its median top/bottom and median colours, so roofs and facades read as clean blocks instead of per-cell noise
import numpy as np,collections
from scipy import ndimage
S=np.load('spans.npy');pal=np.load('pal.npy');Q=lambda c:np.argmin(((pal[None]-c[:,None])**2).sum(2),1)
TOL={0:1,1:1,2:1,3:1,4:1,5:1,6:1,7:0}
out=[]
order=np.lexsort((S[:,4],S[:,3],S[:,2],S[:,1],S[:,0]));S=S[order]
key=S[:,0]*1e7+S[:,1];cols=S[:,0]*1e13+S[:,1]*1e8+(S[:,2]+5000)*1e4+(S[:,3]+5000)
lay=np.zeros(len(S),int)
for i in range(1,len(S)):
  if cols[i]==cols[i-1]:lay[i]=lay[i-1]+1
ug=np.unique(np.c_[key,lay],axis=0)
idx=collections.defaultdict(list)
for i,(k,l) in enumerate(zip(key,lay)):idx[(k,l)].append(i)
for (k,l),ii in idx.items():
  rs=S[ii];ci=int(rs[0,0]);tol=TOL[ci]
  if tol==0:out.append(rs);continue
  u=rs[:,2].astype(int);v=rs[:,3].astype(int);u-=u.min();v-=v.min()
  # cluster tops in 1-D (chains of <= tol steps), then connected regions per cluster
  t=rs[:,5];ut=np.unique(t);br=np.r_[0,np.flatnonzero(np.diff(ut)>tol)+1];cl=np.searchsorted(ut[br],t,side='right')-1
  b=rs[:,4];grounded=b==0
  for c in np.unique(cl):
    for gflag in (True,False):
      m=(cl==c)&(grounded==gflag)
      if not m.any():continue
      M=np.zeros((v.max()+1,u.max()+1),bool);M[v[m],u[m]]=True;lab,n=ndimage.label(M);L=lab[v[m],u[m]];sub=rs[m].copy()
      for r in range(1,n+1):
        s=sub[L==r];s[:,5]=np.round(np.median(s[:,5]))
        if not gflag:s[:,4]=np.round(np.median(s[:,4]))
        s[:,5]=np.maximum(s[:,5],s[:,4]+1)
        s[:,11]=Q(np.median(pal[s[:,11].astype(int)],0)[None])[0];sc_=pal[s[:,12].astype(int)]
        if ci in(0,1):lu=sc_@[.3,.59,.11];s[:,12]=s[np.argsort(lu)[int(len(lu)*.7)],12]
        else:s[:,12]=Q(np.median(sc_,0)[None])[0]
        sub[L==r]=s
      out.append(sub)
O=np.concatenate(out);np.save('spans_s.npy',O);print(len(S),len(O))
