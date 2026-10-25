# top-down colour map of the survey (our coords): every triangle painted in its own colour, low to high, with a grid
import numpy as np,sys
from PIL import Image,ImageDraw
D=np.load('tris.npz');C=np.load('cols.npz')
x0,z0,x1,z1,res=[float(a) for a in sys.argv[1:6]];out=sys.argv[6]
W=int((x1-x0)/res);H=int((z1-z0)/res)
T=[];Cl=[]
skip={'imola_a_001','imola_b_001','imola_c_001','imola_d_001','grass_001','green_001','sand_001','sand_brd_001','brd_001','groove_001','marbles_001','trees_new2_001','trees_new2_003','it_pines_001','driver_face_001','driver_suit_001','top_ext_001','WorldGridMaterial_001'}
for n in D.files:
  if n in skip:continue
  t=D[n];c=t.mean(1);m=(c[:,0]>x0-20)&(c[:,0]<x1+20)&(c[:,2]>z0-20)&(c[:,2]<z1+20);T.append(t[m]);Cl.append(C[n][m])
T=np.concatenate(T);Cl=np.concatenate(Cl);o=np.argsort(T[:,:,1].max(1));T=T[o];Cl=Cl[o]
im=Image.new('RGB',(W,H),(255,255,255));d=ImageDraw.Draw(im)
for t,c in zip(T,Cl):
  d.polygon([((p[0]-x0)/res,(z1-p[2])/res) for p in t],fill=tuple(int(v) for v in c))
for gx in np.arange(np.ceil(x0/10)*10,x1,10):
  X=(gx-x0)/res;d.line([(X,0),(X,H)],fill=(255,0,255) if gx%50==0 else (200,200,200),width=1)
for gz in np.arange(np.ceil(z0/10)*10,z1,10):
  Z=(z1-gz)/res;d.line([(0,Z),(W,Z)],fill=(255,0,255) if gz%50==0 else (200,200,200),width=1)
for gx in np.arange(np.ceil(x0/50)*50,x1,50):
  for gz in np.arange(np.ceil(z0/50)*50,z1,50):d.text(((gx-x0)/res+2,(z1-gz)/res+2),f'{int(gx)},{int(gz)}',fill=(0,0,0))
im.save(out)
