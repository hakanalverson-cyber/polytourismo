import numpy as np
from skimage.draw import polygon
D=np.load('tris.npz');C=0.5;X0,Z0=-150,-200;W,H=int(2550/C),int(1700/C)
def mask(names):
  M=np.zeros((H,W),bool)
  for n in names:
    if n not in D.files:continue
    T=D[n]
    for tri in T:
      xs=(tri[:,0]-X0)/C;zs=(tri[:,2]-Z0)/C
      if xs.min()<0 or zs.min()<0 or xs.max()>=W or zs.max()>=H:continue
      rr,cc=polygon(zs,xs,(H,W));M[rr,cc]=True
  return M
cls={'grass':['grass_001'],'terr':['imola_a_001','imola_b_001','imola_c_001','imola_d_001'],'green':['green_001'],'aold':['asph_old_001'],'sand':['sand_001'],'sandb':['sand_brd_001'],'road':['asphalt_001','asphalt_dark_001'],'kerb':['curbs_001','curb_green_001'],'marb':['marbles_001'],'brd':['brd_001']}
out={k:mask(v) for k,v in cls.items()}
np.savez_compressed('masks.npz',**out)
for k,v in out.items():print(k,v.sum()*C*C)
from PIL import Image
img=np.full((H,W,3),255,np.uint8)
col={'terr':(150,170,120),'grass':(90,170,70),'green':(0,140,110),'aold':(120,120,130),'sand':(235,205,130),'sandb':(200,150,60),'brd':(255,0,255),'marb':(60,60,60),'road':(70,70,75),'kerb':(230,0,0)}
for k in ['terr','grass','green','aold','brd','sandb','sand','marb','road','kerb']:img[out[k]]=col[k]
Image.fromarray(img[::-1]).save('map.png')
Image.fromarray(img[::-1]).resize((W//4,H//4)).save('map_s.png')
