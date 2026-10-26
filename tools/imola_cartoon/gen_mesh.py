# scenery meshes + textures of the bought cartoon Imola -> one JS asset (window.PT8_IMC) for the game
# usage: gen_mesh.py S texsize out.js
import numpy as np,json,sys,base64,io,re,pyfqmr
from PIL import Image
from scipy.spatial import cKDTree
Image.MAX_IMAGE_PIXELS=None
SP='/tmp/claude-0/-home-claude-polytourismo/4b0e7c59-35bd-554a-8c30-0ab78fa183a0/scratchpad/'
TX=SP+'cimola2/textures/';S=float(sys.argv[1]);TS=int(sys.argv[2]);OUT=sys.argv[3]
d=np.load(SP+'cimola/raw.npz');names=sorted(set(k[:-2] for k in d.files if k.endswith('_v')))
def texof(n):
  for k,t in [('collider',None),('track_surface','road'),('stadium_road','road_s'),('garages','garages_imola'),('_IMOLA','IMOLA'),('grass_1','grass_1'),('grass_2','grass_2'),('gravel','gravel'),('bottom_rock','rock'),('tyres','tyres'),('banners','banners'),('trees','trees'),('baloon','baloon'),('fence','fence'),('logo','logo'),('white_line','#d2d2d2'),('startlights','#ff2a1a')]:
    if k in n:return t
  return '?'
TEXF={'road':'road.png','garages_imola':'garages_imola.png','IMOLA':'IMOLA.png','grass_1':'grass_1.png','grass_2':'grass_2.png','gravel':'gravel.png','rock':'rock.png','tyres':'tyres.png','banners':'banners.png','trees':'trees.png','baloon':'baloon.png','fence':'imola_fence_fence_metal_0_Alpha.png','logo':'imola_ground_logo.png'}
SIZE={'road':TS,'garages_imola':TS,'IMOLA':TS,'banners':TS,'logo':TS,'grass_1':512,'grass_2':512,'gravel':512,'rock':256,'tyres':256,'trees':256,'baloon':256,'fence':256}
BAKE=lambda n:bool(re.search(r'trees|tyres|startlights',n))
RATIO=lambda n:.16 if 'trees' in n else .14 if 'tyres' in n else .3 if 'seats' in n else .2
tcache={}
# stacked ground layers are lifted a few cm apart instead of depth-offset (offsets swallow anything standing on a slope)
LIFT={'imola_bottom_rock_0':-.1,'imola_grass_2_grass_2_0':.03,'imola_gravel_nocol1_gravel_0':.06,'imola_stadium_road_imola_0':.09,'imola_track_surface_road_imola_0':.12,'imola_logo_ground_imola_ground_logo_0':.15,'start_line_white_line_0':.18}
def img(t):
  if t not in tcache:tcache[t]=np.asarray(Image.open(TX+TEXF[t]).convert('RGBA').resize((512,512)))
  return tcache[t]
def b64(a):return base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()
meshes=[];tot=0;TILE=350.
def emit(mat,P,F,U=None,Cl=None):
  global tot
  cen=P[F].mean(1);key=np.floor(cen[:,[0,2]]/TILE).astype(int);ks=key[:,0]*10000+key[:,1]
  for k in np.unique(ks):
    fm=F[ks==k];vi,inv=np.unique(fm.ravel(),return_inverse=True);p=P[vi];o=(p.max(0)+p.min(0))/2;ext=np.abs(p-o).max();q=max(ext/32000,.002)
    m={'m':mat,'o':np.round(o,3).tolist(),'q':q,'p':b64(np.round((p-o)/q).astype(np.int16)),'i':b64(inv.astype(np.uint16 if len(vi)<65536 else np.uint32)),'i32':int(len(vi)>=65536)}
    if U is not None:m['u']=b64(np.clip(np.round(U[vi]*256),-32767,32767).astype(np.int16))
    if Cl is not None:m['c']=b64(Cl[ks==k].astype(np.uint8))  # one colour per face
    meshes.append(m);tot+=len(fm)
# the rock shell under the world runs just under the grass on every hill and shows through it in pale streaks: keep only its faces that stand clear of the grass
sys.path.insert(0,'.');from rast import raster
GC=1.;gx0,gz0=-1030.,-430.;gnx,gnz=2070,900
GR=None
for gn in ['imola_grass_1_nocol_grass_1_0','imola_grass_2_grass_2_0','imola_gravel_nocol1_gravel_0','imola_stadium_road_imola_0','imola_track_surface_road_imola_0']:
  GR=raster(d[gn+'_v'].astype(np.float64)*S,d[gn+'_f'],gx0,gz0,gnx,gnz,GC,GR)
def under_grass(t):
  ix=np.clip(np.round((t[...,0]-gx0)/GC).astype(int),0,gnx-1);iz=np.clip(np.round((t[...,2]-gz0)/GC).astype(int),0,gnz-1);g=GR[iz,ix]
  return np.all(~np.isnan(g)&(t[...,1]<g+.6),axis=1)
for n in names:
  t=texof(n)
  if t is None:continue
  v=d[n+'_v'].astype(np.float64)*S;f=d[n+'_f'];uv=d[n+'_uv'].astype(np.float64)
  v=v+np.array([0,LIFT.get(n,0),0])
  if BAKE(n):
    # per-face colour from the texture, then merge + decimate, then recolour from the nearest original face
    if t.startswith('#'):fc=np.tile(np.array([int(t[1:3],16),int(t[3:5],16),int(t[5:7],16)]),(len(f),1))
    else:
      im=img(t);c=uv[f].mean(1);x=(np.mod(c[:,0],1)*511).astype(int);y=((1-np.mod(c[:,1],1))*511).astype(int);fc=im[y,x,:3]
    vk,inv=np.unique(np.round(v,2),axis=0,return_inverse=True);inv=inv.ravel();ff=inv[f]
    ff=ff[(ff[:,0]!=ff[:,1])&(ff[:,1]!=ff[:,2])&(ff[:,0]!=ff[:,2])]
    sim=pyfqmr.Simplify();sim.setMesh(vk,ff);sim.simplify_mesh(target_count=max(200,int(len(ff)*RATIO(n))),aggressiveness=7,preserve_border=False,verbose=False)
    nv,nf,_=sim.getMesh();cen0=v[f].mean(1);_,ni=cKDTree(cen0).query(nv[nf].mean(1));col=fc[ni]
    emit('c',nv,nf,Cl=col);print(n,len(f),'->',len(nf))
  else:
    mat=t if not t.startswith('#') else t
    # share vertices that have the same position and uv
    if t=='rock':
      keep=~under_grass(v[f]);print('rock faces kept',keep.sum(),'of',len(f));f=f[keep]
    key=np.c_[np.round(v,3),np.round(uv,4)];_,first,inv=np.unique(key,axis=0,return_index=True,return_inverse=True);inv=inv.ravel()
    emit(mat,v[first],inv[f],U=None if t.startswith('#') else uv[first]);print(n,len(f),len(v),'->',len(first))
print('total tris',tot,'meshes',len(meshes))
tex={}
for t,fn in TEXF.items():
  if t=='road_s':continue
  im=Image.open(TX+fn).convert('RGBA');sz=SIZE[t];im=im.resize((sz,sz*im.size[1]//im.size[0]),Image.LANCZOS);b=io.BytesIO()
  if t in('fence',):im.save(b,'PNG',optimize=True);tex[t]='data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()
  else:im.convert('RGB').save(b,'JPEG',quality=82);tex[t]='data:image/jpeg;base64,'+base64.b64encode(b.getvalue()).decode()
J=json.load(open(SP+'cimola/track.json'));g=J['grid']
g['h']=base64.b64encode(open(SP+'cimola/hf.i16','rb').read()).decode();g['k']=base64.b64encode(open(SP+'cimola/cls.rle','rb').read()).decode()
out={'S':S,'pts':J['pts'],'grid':g,'segs':b64(np.array(J['segs'],np.float32)),'tex':tex,'meshes':meshes}
open(OUT,'w').write('/* Imola: "Cartoon Race Track Imola" 3D model bought by Hakan (Retro Cartoon Racing). Generated by tools/imola_cartoon; do not edit. */\nwindow.PT8_IMC='+json.dumps(out,separators=(',',':'))+';\n')
import os;print('bytes',os.path.getsize(OUT))
