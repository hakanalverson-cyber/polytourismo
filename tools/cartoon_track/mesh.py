# scenery meshes + textures of a cartoon track pack, written with the driving data as one track file (gzipped JSON)
# usage: mesh.py <config.json> <texsize> <out.ptrack>
import numpy as np,json,sys,base64,io,re,gzip,os,pyfqmr
from PIL import Image,ImageEnhance
from scipy.spatial import cKDTree
Image.MAX_IMAGE_PIXELS=None
sys.path.insert(0,__file__.rsplit('/',1)[0]);from rast import raster
C=json.load(open(sys.argv[1]));TS=int(sys.argv[2]);OUT=sys.argv[3];W=C['work'];TX=C['texdir']
J=json.load(open(W+'/track.json'));S=J['S']
d=np.load(W+'/raw.npz');meta=json.load(open(W+'/meta.json'))
names=sorted(set(k[:-2] for k in d.files if k.endswith('_v')))
sat=C.get('sat',1.0)
LIFT={}
for pat,cl,lift in C['ground']+[[p,0,l] for p,l in C.get('lift',{}).items()]:
  for n in names:
    if re.search(pat,n) and n not in LIFT:LIFT[n]=lift
def texof(n):
  if re.search(C['skip'],n):return None
  for pat,t in C.get('texmap',[]):
    if re.search(pat,n):return t
  m=meta.get(n,{})
  if m.get('tex'):return os.path.basename(m['tex'])
  c=m.get('col',[1,1,1,1]);return '#%02x%02x%02x'%tuple(int(round(255*min(1,x)**(1/2.2))) for x in c[:3])
def satc(rgb):  # same colour boost as the textures
  im=Image.fromarray(np.asarray(rgb,np.uint8).reshape(1,-1,3));return np.asarray(ImageEnhance.Color(im).enhance(sat)).reshape(-1,3)
tcache={}
def img(t):
  if t not in tcache:tcache[t]=np.asarray(Image.open(TX+t).convert('RGB').resize((512,512)))
  return tcache[t]
b64=lambda a:base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()
meshes=[];tot=0;TILE=C.get('tile',300.)
def emit(mat,P,F,U=None,Cl=None):
  # one quantisation step per material, tile origins on that step: a vertex shared by two tiles lands on exactly the same spot in both (no seams)
  global tot
  cen=P[F].mean(1);key=np.floor(cen[:,[0,2]]/TILE).astype(int);ks=key[:,0]*10000+key[:,1];tiles=[]
  ext=0
  for k in np.unique(ks):
    fm=F[ks==k];vi=np.unique(fm.ravel());p=P[vi];o=(p.max(0)+p.min(0))/2;ext=max(ext,np.abs(p-o).max());tiles.append((k,fm,vi,o))
  q=.002
  while ext/q>32000:q*=2
  for k,fm,vi,o in tiles:
    inv=np.searchsorted(vi,fm.ravel());o=np.round(o/q)*q;ip=np.round(P[vi]/q).astype(np.int64)-np.round(o/q).astype(np.int64)
    m={'m':mat,'o':o.tolist(),'q':q,'p':b64(ip.astype(np.int16)),'i':b64(inv.astype(np.uint16 if len(vi)<65536 else np.uint32)),'i32':int(len(vi)>=65536)}
    if U is not None:m['u']=b64(np.clip(np.round(U[vi]*256),-32767,32767).astype(np.int16))
    if Cl is not None:m['c']=b64(Cl[ks==k].astype(np.uint8))
    meshes.append(m);tot+=len(fm)
# rock shells that run just under the grass show through it: keep only their faces that stand clear
GR=None
if C.get('rock'):
  gl=[n for n in names if any(re.search(p,n) for p,cl,l in C['ground']) and not re.search(C['rock'],n)]
  allv=np.concatenate([d[n+'_v'] for n in gl])*S;gx0,gz0=allv[:,[0,2]].min(0)-2;gnx,gnz=(np.ceil((allv[:,[0,2]].max(0)-[gx0,gz0]))+4).astype(int)
  for n in gl:GR=raster(d[n+'_v'].astype(np.float64)*S+[0,LIFT.get(n,0),0],d[n+'_f'],gx0,gz0,gnx,gnz,1.,GR)
used=set()
for n in names:
  t=texof(n)
  if t is None:continue
  v=d[n+'_v'].astype(np.float64)*S+[0,LIFT.get(n,0),0];f=d[n+'_f'];uv=d[n+'_uv'].astype(np.float64)
  if re.search(C['bake'],n):
    if t.startswith('#'):fc=np.tile([int(t[1:3],16),int(t[3:5],16),int(t[5:7],16)],(len(f),1))
    else:im=img(t);c=uv[f].mean(1);fc=im[((1-np.mod(c[:,1],1))*511).astype(int),(np.mod(c[:,0],1)*511).astype(int)]
    fc=satc(fc)
    vk,inv=np.unique(np.round(v,2),axis=0,return_inverse=True);ff=inv.ravel()[f];ff=ff[(ff[:,0]!=ff[:,1])&(ff[:,1]!=ff[:,2])&(ff[:,0]!=ff[:,2])]
    r=C['ratio'].get(next((k for k in C['ratio'] if k!='default' and re.search(k,n)),'default'))
    sim=pyfqmr.Simplify();sim.setMesh(vk,ff);sim.simplify_mesh(target_count=max(200,int(len(ff)*r)),aggressiveness=7,preserve_border=False,verbose=False)
    nv,nf,_=sim.getMesh();_,ni=cKDTree(v[f].mean(1)).query(nv[nf].mean(1))
    emit('c',nv,nf,Cl=fc[ni]);print(n,len(f),'->',len(nf))
  else:
    if C.get('rock') and re.search(C['rock'],n) and GR is not None:
      t3=v[f];ix=np.clip(np.round((t3[...,0]-gx0)).astype(int),0,gnx-1);iz=np.clip(np.round((t3[...,2]-gz0)).astype(int),0,gnz-1);g=GR[iz,ix]
      keep=~np.all(~np.isnan(g)&(t3[...,1]<g+.6),axis=1);f=f[keep];print('rock kept',keep.sum())
    key=np.c_[np.round(v,3),np.round(uv,4)];_,first,inv=np.unique(key,axis=0,return_index=True,return_inverse=True);inv=inv.ravel()
    if not t.startswith('#'):used.add(t)
    emit(t,v[first],inv[f],U=None if t.startswith('#') else uv[first]);print(n,len(f))
print('total tris',tot,'meshes',len(meshes))
tex={}
for t in sorted(used):
  im=Image.open(TX+t).convert('RGBA');big=any(re.search(p,t) for p in C.get('bigtex',[]));sz=TS if big else min(512,TS)
  im=im.resize((sz,max(1,sz*im.size[1]//im.size[0])),Image.LANCZOS);b=io.BytesIO()
  rgb=ImageEnhance.Color(im.convert('RGB')).enhance(sat)
  if any(re.search(p,t) for p in C.get('alpha',[])):rgb.putalpha(im.getchannel('A'));rgb.save(b,'PNG',optimize=True);tex[t]='data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()
  else:rgb.save(b,'JPEG',quality=82);tex[t]='data:image/jpeg;base64,'+base64.b64encode(b.getvalue()).decode()
g=J['grid'];g['h']=base64.b64encode(open(W+'/hf.i16','rb').read()).decode();g['k']=base64.b64encode(open(W+'/cls.rle','rb').read()).decode()
out={'v':1,'id':C['id'],'name':C['name'],'replaces':C['replaces'],'medal':C.get('medal'),'carScale':C.get('carScale',1),'alpha':[t for t in used if any(re.search(p,t) for p in C.get('alpha',[]))],'S':S,'pts':J['pts'],'grid':g,
 'segs':b64(np.array(J['segs'],np.float32).reshape(-1,4)),'tex':tex,'meshes':meshes,'credit':C.get('credit','')}
raw=json.dumps(out,separators=(',',':')).encode()
if OUT.endswith('.json'):open(OUT,'wb').write(raw)
else:open(OUT,'wb').write(gzip.compress(raw,6))
print('bytes',len(raw),'file',os.path.getsize(OUT))
