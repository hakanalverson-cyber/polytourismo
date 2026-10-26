# ground surfaces (gravel, green paint, asphalt outside the track) as row runs, straight from the model's outlines; kerbs per sample
import numpy as np,json
from scipy.spatial import cKDTree
from scipy import ndimage
M=np.load('masks.npz');C=.5;X0,Z0=-150,-200;H,W=M['sand'].shape
d=json.load(open('../imT.json'));X=np.array(d['x']);Z=np.array(d['z']);psi=np.array(d['psi']);hw=np.array(d['hw']);N=len(X)
u=np.linspace(0,N,8*N,endpoint=False);ki=np.floor(u).astype(int);fr=u-ki;k2=(ki+1)%N
DX=X[ki]+(X[k2]-X[ki])*fr;DZ=Z[ki]+(Z[k2]-Z[ki])*fr;DH=hw[ki]+(hw[k2]-hw[ki])*fr;tr=cKDTree(np.c_[DX,DZ])
gx,gz=np.meshgrid(X0+(np.arange(W)+.5)*C,Z0+(np.arange(H)+.5)*C)
dd,j=tr.query(np.c_[gx.ravel(),gz.ravel()],distance_upper_bound=80);dd=dd.reshape(H,W);j=np.minimum(j,len(DH)-1).reshape(H,W)
ex=dd-DH[j];onroad=ex<0.05
def clean(m):m=ndimage.binary_closing(m,iterations=2);m=ndimage.binary_opening(m,iterations=1);return m
layers={'sand':clean(M['sand']|M['sandb'])&~onroad,'green':clean(M['green'])&~onroad,'asph':ndimage.binary_opening(clean(M['aold']|((M['road']|M['marb'])&(ex>2.0))),iterations=2)&~onroad}
layers['asph']&=~M['grass']   # asphalt the survey hides under grass is not shown
layers['asph']=ndimage.binary_opening(layers['asph'],iterations=2);layers['green']=ndimage.binary_opening(layers['green'],iterations=1)
layers['green']&=~layers['sand'];layers['asph']&=~layers['sand']
# asphalt hugging the road edge is the survey's pale blue painted strip
layers['edge']=layers['asph']&(ex<4.5);layers['asph']&=~layers['edge']
res={}
for k,m in layers.items():
  rows=[]
  for i in range(H):
    r=m[i];e=np.diff(np.r_[0,r.astype(np.int8),0]);s=np.nonzero(e==1)[0];t=np.nonzero(e==-1)[0]
    for a,b in zip(s,t):
      if b-a<2:continue
      rows+= [i,round((X0+a*C)*4),round((X0+b*C)*4)]
  res[k]=rows;print(k,len(rows)//3,'runs',m.sum()*C*C,'m2')
# kerbs per sample and side: inner and outer offset past the road edge (m), from the model's kerb outline
K=ndimage.binary_closing(M['kerb'],iterations=1);kb=[[],[]]
for k in range(N):
  c,s=np.cos(psi[k]),np.sin(psi[k])
  for si,sd in enumerate((-1,1)):
    hit=[]
    for l in np.arange(-1.5,4.01,.25):
      L=sd*(hw[k]+l);x=X[k]+c*L;z=Z[k]-s*L;r=int((z-Z0)/C);q=int((x-X0)/C)
      if 0<=r<H and 0<=q<W and K[r,q]:hit.append(l)
    kb[si].append([min(hit),max(hit)+.25] if len(hit)>=2 else None)
# drop single-sample blips, bridge 1-sample gaps
for si in range(2):
  a=kb[si]
  for k in range(N):
    if a[k] is None and a[(k-1)%N] and a[(k+1)%N]:a[k]=[(a[(k-1)%N][0]+a[(k+1)%N][0])/2,(a[(k-1)%N][1]+a[(k+1)%N][1])/2]
  for k in range(N):
    if a[k] and not a[(k-1)%N] and not a[(k+1)%N]:a[k]=None
  print('kerb side',si,sum(1 for v in a if v))
res['kerb']=[[(round(v[0]*10)+20 if v else 255) for v in kb[si]]+[(round(v[1]*10)+20 if v else 255) for v in kb[si]] for si in range(2)]
res['N']=N
json.dump(res,open('ground.json','w'))
