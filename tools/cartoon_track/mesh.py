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
# colour grading: textures listed in "grade" are tinted so their average colour becomes the given one (the Atlanta model ships olive grass and
# brown asphalt; Imola's are a clear green and grey), then every colour gets the saturation boost
GAIN={}
def gain(t):
  if t not in GAIN:
    g=next((c for p,c in C.get('grade',[]) if re.search(p,t)),None)
    GAIN[t]=None if g is None or t.startswith('#') else np.array(g,float)/np.maximum(1,np.asarray(Image.open(TX+t).convert('RGB').resize((64,64)),float).reshape(-1,3).mean(0))
  return GAIN[t]
def gradea(a,t):
  k=gain(t);return a if k is None else np.clip(np.asarray(a,float)*k,0,255).astype(np.uint8)
def satc(rgb,t=''):  # same colour boost as the textures
  rgb=gradea(rgb,t);im=Image.fromarray(np.asarray(rgb,np.uint8).reshape(1,-1,3));return np.asarray(ImageEnhance.Color(im).enhance(sat)).reshape(-1,3)
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
# ---- trees: one tree at a time. The decimation used to melt trunk and crown into one blob with one colour; now every tree (a connected piece of the
# mesh) is simplified on its own and its trunk is painted wood brown: the thin faces round the tree's axis in the lower three quarters are the trunk.
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import connected_components
TREEP=re.compile(C.get('trees',r'prop_tree|tree_group|TREE_CLUSTER|TREE_BLOCK|TREE_\d'),re.I);TREEX=re.compile(r'log|collider|bush|vine|rose',re.I)
TREEB=[]
BROWNS=np.array([[92,64,40],[104,74,46],[80,57,38],[112,82,52],[86,60,44]]);BIRCH=np.array([206,201,190])
def treemesh(n,t,v,f,uv):
  if t.startswith('#'):fc=np.tile([int(t[1:3],16),int(t[3:5],16),int(t[5:7],16)],(len(f),1))
  else:im=img(t);c=uv[f].mean(1);fc=im[((1-np.mod(c[:,1],1))*511).astype(int),(np.mod(c[:,0],1)*511).astype(int)]
  fc=satc(fc,t)
  vk,inv=np.unique(np.round(v,2),axis=0,return_inverse=True);ff=inv.ravel()[f];good=(ff[:,0]!=ff[:,1])&(ff[:,1]!=ff[:,2])&(ff[:,0]!=ff[:,2]);ff=ff[good];fc=fc[good]
  nvx=len(vk);g=coo_matrix((np.ones(len(ff)*2),(np.r_[ff[:,0],ff[:,1]],np.r_[ff[:,1],ff[:,2]])),shape=(nvx,nvx))
  _,lab=connected_components(g,directed=False);fl=lab[ff[:,0]]
  r=C['ratio'].get(next((k for k in C['ratio'] if k!='default' and re.search(k,n)),'default'))
  birch=re.search('birch',n,re.I) is not None;rng=np.random.RandomState(len(ff))
  order=np.argsort(fl,kind='stable');fl_s=fl[order];cuts=np.r_[0,np.nonzero(np.diff(fl_s))[0]+1,len(fl_s)]
  OV=[];OF=[];OC=[];off=0;ntr=0
  for a_,b_ in zip(cuts[:-1],cuts[1:]):
    ix=order[a_:b_];fi=ff[ix];cc=fc[ix].copy();uv_=np.unique(fi);P_=vk[uv_];y0=P_[:,1].min();H=P_[:,1].max()-y0
    W=max(np.ptp(P_[:,0]),np.ptp(P_[:,2]))
    istr=False
    if H>1.2 and len(ix)>=6:   # a tree you can hit: where its foot stands (a crown piece that floats above the ground is not one; its trunk piece is)
      lw=P_[P_[:,1]<y0+.12*H+.05];bc=lw[:,[0,2]].mean(0);br=float(np.clip(np.median(np.hypot(lw[:,0]-bc[0],lw[:,2]-bc[1])),.3,.7))
      gh=None
      if GR is not None:
        gi=int(round(bc[0]-gx0));gj=int(round(bc[1]-gz0))
        if 0<=gi<gnx and 0<=gj<gnz and not np.isnan(GR[gj,gi]):gh=GR[gj,gi]
      if gh is None or y0<gh+1.4:TREEB.append((bc[0],bc[1],br))
    if C.get('trunkfix',1) and H>1.2 and len(ix)>=8 and W/H<.3:
      cx=(P_[:,0].min()+P_[:,0].max())/2;cz=(P_[:,2].min()+P_[:,2].max())/2;rr=np.hypot(P_[:,0]-cx,P_[:,2]-cz);hh=(P_[:,1]-y0)/H
      lo_=rr[(hh>.08)&(hh<.35)];hi_=rr[(hh>.65)&(hh<.92)]
      istr=len(lo_)>0 and len(hi_)>0 and lo_.max()>0 and (hi_.max()/lo_.max()>=.38 or np.median(hi_)/np.median(lo_)>=.5 or W/H<.12)   # a trunk is a column: as wide at the top as at the bottom (a spruce crown is a cone)
    if istr:   # a thin, tall piece of the tree is its trunk (the crowns are separate wide pieces)
      col=BIRCH if birch else BROWNS[rng.randint(len(BROWNS))]
      cc[:]=np.clip(col+rng.randint(-8,9,(len(ix),1)),0,255);ntr+=1
    # simplify this tree alone
    rm,rinv=np.unique(fi,return_inverse=True);pv=vk[rm];pf=rinv.reshape(-1,3)
    tgt=max(36,int(len(pf)*r));ncc=cc
    if len(pf)>tgt*1.2:
      sim=pyfqmr.Simplify();sim.setMesh(pv,pf);sim.simplify_mesh(target_count=tgt,aggressiveness=6,preserve_border=False,verbose=False);nv,nf,_=sim.getMesh()
      if len(nf)<4:nv,nf=pv,pf
      else:
        _,ni=cKDTree(pv[pf].mean(1)).query(nv[nf].mean(1));ncc=cc[ni]
    else:nv,nf=pv,pf
    OV.append(nv);OF.append(nf+off);OC.append(ncc);off+=len(nv)
  NV=np.concatenate(OV);NF=np.concatenate(OF);NC=np.concatenate(OC)
  emit('c',NV,NF,Cl=NC);print(n,len(f),'->',len(NF),'trees',len(cuts)-1,'with trunks',ntr)
# rally stages: only scenery near the stage route is kept (the maps are whole road networks)
CLIP=C.get('clip');CT=None
if CLIP:
  RT=np.array([[p[0],p[1]] for p in J['stage']['route']]);CT=cKDTree(RT)
  clipr=lambda n:next((r for p,r in CLIP.get('by',[]) if re.search(p,n)),CLIP['default'])
seen=set()
for n in names:
  t=texof(n)
  if t is None:continue
  # the exporter repeats some meshes under many names (colliders, ice-road pieces): keep one
  _k=(len(d[n+'_v']),len(d[n+'_f']),round(float(d[n+'_v'].astype(np.float64).sum()),1),round(float(d[n+'_f'].astype(np.float64).sum())))
  if _k in seen:continue
  seen.add(_k)
  v=d[n+'_v'].astype(np.float64)*S+[0,LIFT.get(n,0),0];f=d[n+'_f'];uv=d[n+'_uv'].astype(np.float64)
  if CT is not None:
    f=f[CT.query(v[f].mean(1)[:,[0,2]])[0]<clipr(n)]
    if not len(f):continue
  if re.search(C['bake'],n) and TREEP.search(n) and not TREEX.search(n):
    treemesh(n,t,v,f,uv)
  elif re.search(C['bake'],n):
    if t.startswith('#'):fc=np.tile([int(t[1:3],16),int(t[3:5],16),int(t[5:7],16)],(len(f),1))
    else:im=img(t);c=uv[f].mean(1);fc=im[((1-np.mod(c[:,1],1))*511).astype(int),(np.mod(c[:,0],1)*511).astype(int)]
    fc=satc(fc,t)
    if re.search('log',n,re.I) and not re.search('collider',n,re.I):   # logs and log piles sampled the green of the tree atlas: bark brown, cut ends pale wood
      lr=np.random.RandomState(len(f)).randint(-7,8,(len(f),1));fc=np.clip(np.where((fc.mean(1)>125)[:,None],np.array([203,164,112]),np.array([96,68,45]))+lr,0,255)
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
# the map's own start / finish dressing (arches, tents, banners): the exporter merges all the props into one mesh repeated under many (skipped) names, so the
# pieces within "r" metres of the given points are cut out of it and drawn with its own texture
for sp in C.get('pieces',[]):
  n=sp['mesh'];m=meta.get(n,{});t=os.path.basename(m['tex']) if m.get('tex') else None
  if not t:print('piece mesh has no texture',n);continue
  v=d[n+'_v'].astype(np.float64)*S;f=d[n+'_f'];uv=d[n+'_uv'].astype(np.float64)
  cf=v[f].mean(1)[:,[0,2]];sel=np.zeros(len(f),bool)
  for q in sp['at']:sel|=np.hypot(cf[:,0]-q[0],cf[:,1]-q[1])<sp.get('r',40)
  f=f[sel]
  if not len(f):continue
  key=np.c_[np.round(v,3),np.round(uv,4)];_,first,inv=np.unique(key,axis=0,return_index=True,return_inverse=True);inv=inv.ravel()
  used.add(t);emit(t,v[first],inv[f],U=uv[first]);print('piece',n,len(f))
print('total tris',tot,'meshes',len(meshes))
# tree collision: every trunk within 45 m of the route is a small diamond the car can hit (the forest is solid, so the corridor wall can sit well back)
CPTS=np.zeros((0,3),np.float32)
if TREEB and C.get('treecol',1):
  RR=np.array([[p[0],p[1]] for p in J['stage']['route']]);RK=cKDTree(RR);hwr=np.array(J['stage'].get('hw',[4]*len(RR)))
  tb=np.array(TREEB);dd,ii=RK.query(tb[:,:2]);ok=(dd<45)&(dd>hwr[np.minimum(ii,len(hwr)-1)]+.8);tb=tb[ok]
  tb=np.unique(np.round(tb,1),axis=0);CPTS=tb.astype(np.float32);print('tree colliders',len(tb))
tex={}
for t in sorted(used):
  im=Image.open(TX+t).convert('RGBA');big=any(re.search(p,t) for p in C.get('bigtex',[]));sz=TS if big else min(512,TS)
  im=im.resize((sz,max(1,sz*im.size[1]//im.size[0])),Image.LANCZOS);b=io.BytesIO()
  rgb=ImageEnhance.Color(Image.fromarray(gradea(np.asarray(im.convert('RGB')),t))).enhance(sat)
  if any(re.search(p,t) for p in C.get('alpha',[])):rgb.putalpha(im.getchannel('A'));rgb.save(b,'PNG',optimize=True);tex[t]='data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()
  else:rgb.save(b,'JPEG',quality=82);tex[t]='data:image/jpeg;base64,'+base64.b64encode(b.getvalue()).decode()
g=J['grid'];g['h']=base64.b64encode(open(W+'/hf.i16','rb').read()).decode();g['k']=base64.b64encode(open(W+'/cls.rle','rb').read()).decode()
import time
SHP=C.get('shot');SHOT=('data:image/jpeg;base64,'+base64.b64encode(open(SHP,'rb').read()).decode()) if SHP and os.path.exists(SHP) else None
out={'v':1,'rev':int(time.time()),'id':C['id'],'name':C['name'],'replaces':C['replaces'],'medal':C.get('medal'),'carScale':C.get('carScale',1),'alpha':[t for t in used if any(re.search(p,t) for p in C.get('alpha',[]))],'S':S,'pts':J['pts'],'grid':g,
 'over':J.get('over',[]),'stage':J.get('stage'),'slots':J.get('slots',[]),'segs':b64(np.array(J['segs'],np.float32).reshape(-1,4)),'cpts':b64(CPTS.reshape(-1,3)),'shot':SHOT,'tex':tex,'meshes':meshes,'credit':C.get('credit',''),'look':C.get('look'),'desc':C.get('desc','')}
raw=json.dumps(out,separators=(',',':')).encode()
if OUT.endswith('.json'):open(OUT,'wb').write(raw)
else:open(OUT,'wb').write(gzip.compress(raw,6))
print('bytes',len(raw),'file',os.path.getsize(OUT))
