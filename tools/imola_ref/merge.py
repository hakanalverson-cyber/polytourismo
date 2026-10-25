# greedy-merge equal spans (same group, bottom, top, colours) on each group's grid into boxes
import numpy as np,collections,sys
NC=int(sys.argv[2]) if len(sys.argv)>2 else 1
S=np.load(sys.argv[3] if len(sys.argv)>3 else 'spans_s.npy');pal=np.load('pal.npy');Q=lambda c:int(np.argmin(((pal-c)**2).sum(1)));tol=int(sys.argv[1]) if len(sys.argv)>1 else 0
out=[]
key=collections.defaultdict(list)
for r in S:
  ci,g,u,v,b,t,DY,R,ox,oz,ang,qt,qs=r;key[(int(ci),int(g))].append(r)
for (ci,g),rs in key.items():
  rs=np.array(rs);u=rs[:,2].astype(int);v=rs[:,3].astype(int);u0,v0=u.min(),v.min();W=u.max()-u0+1;H=v.max()-v0+1
  DY,R,ox,oz,ang=rs[0,6:11]
  grp=collections.defaultdict(list)
  for k,r in enumerate(rs):grp[(int(r[4]),int(r[5]),int(r[11])*(NC or ci in(0,1,2)),int(r[12])*(NC or ci in(0,1,2)))].append(k)
  for (b,t,qt,qs),ks in grp.items():
    M=np.zeros((H,W),bool);M[v[ks]-v0,u[ks]-u0]=True;CT=np.zeros((H,W,3));CS=np.zeros((H,W,3));CT[v[ks]-v0,u[ks]-u0]=pal[rs[ks,11].astype(int)];CS[v[ks]-v0,u[ks]-u0]=pal[rs[ks,12].astype(int)]
    used=np.zeros_like(M)
    for i,j in zip(*np.nonzero(M)):
      if used[i,j]:continue
      e=j
      while e<W and M[i,e] and not used[i,e]:e+=1
      k=i+1
      while k<H and M[k,j:e].all() and not used[k,j:e].any():k+=1
      used[i:k,j:e]=True
      uc=(u0+(j+e)/2)*R;vc=(v0+(i+k)/2)*R;ca,sa=np.cos(ang),np.sin(ang)
      out.append([round((ox+uc*ca-vc*sa)*4),round((oz+uc*sa+vc*ca)*4),round((e-j)*R*4),round((k-i)*R*4),round(b*DY*10),round(t*DY*10),round(ang*1000),Q(CT[i:k,j:e].reshape(-1,3).mean(0)),Q(CS[i:k,j:e].reshape(-1,3).mean(0)),ci])
out=np.array(out,np.int32);np.save('boxes2.npy',out);print(len(out),np.bincount(out[:,9]))
