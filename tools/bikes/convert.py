"""Bike pack converter (Motorbikes Pack.glb -> bikes.pack, gzipped JSON). Run with python3 -I from any folder:
   python3 -I tools/bikes/convert.py <tools/bikes dir> <Motorbikes Pack.glb> <Textures.png> <out.pack> [preview.json]
Splits the pack's 18 bikes (9 models x 2 paints), keeps one geometry per model, and segments each into
body / steer (bars, fork, headlight) / fw / rw so the game can turn the bars and spin the wheels.
The pack is bought content: it lives in /mnt/project-files/poly-gt/packs, never in the public repo."""
import sys,json,gzip,base64,numpy as np
sys.path.insert(0,sys.argv[1]);import gl,bikeseg
from scipy import ndimage
from PIL import Image
j,prims=gl.load(sys.argv[2]);tex=np.asarray(Image.open(sys.argv[3]).convert('RGB')).astype(np.float32)/255
def s2l(c):return np.where(c<=.04045,c/12.92,((c+.055)/1.055)**2.4)
def l2s(c):return np.where(c<=.0031308,c*12.92,1.055*np.power(np.clip(c,0,None),1/2.4)-.055)
T=[];C=[];PID=[]
for pi,p in enumerate(prims):
  tri=p['P'][p['I']];T.append(tri);PID.append(np.full(len(tri),pi))
  m=p['mat'].get('pbrMetallicRoughness',{});bc=np.array(m.get('baseColorFactor',[1,1,1,1])[:3])
  if 'baseColorTexture' in m and p['UV'] is not None:
    uv=p['UV'][p['I']].mean(1);u=np.mod(uv[:,0],1);v=np.mod(uv[:,1],1);H,W,_=tex.shape
    col=l2s(s2l(tex[np.clip((v*H).astype(int),0,H-1),np.clip((u*W).astype(int),0,W-1)])*bc)
  else: col=np.tile(l2s(bc),(len(tri),1))
  C.append(col)
T=np.concatenate(T);C=np.concatenate(C);PID=np.concatenate(PID)
cen=T.mean(1);cell=.03;mn=cen.min(0);g=((cen[:,[0,2]]-mn[[0,2]])/cell).astype(int);G=np.zeros(g.max(0)+1,bool);G[g[:,0],g[:,1]]=True
lab,n=ndimage.label(ndimage.binary_dilation(G,iterations=2));L=lab[g[:,0],g[:,1]]
SC=1.45  # pack units -> metres (sportbike wheelbase ~1.4 m)
# id, cluster, twin cluster, name, kind, stats (top km/h, accel 0-1, handling 0-1, tricks 0-1), segmentation overrides, anchor overrides
BIKES=[
 ('dirt450',10,18,'Dirt 450','DIRT',dict(top=168,acc=.86,hnd=.92,trk=1.0),{},{}),
 ('scrambler',15,17,'Scrambler 1200','SCRAMBLER',dict(top=205,acc=.8,hnd=.84,trk=.86),{},{}),
 ('superbike',3,9,'Superbike 1100','SUPERSPORT',dict(top=299,acc=1.0,hnd=.8,trk=.74),{},{}),
 ('sport600',2,11,'Sport 600','SPORT',dict(top=262,acc=.88,hnd=.86,trk=.78),{},{}),
 ('bobber',5,6,'Bobber 900','NAKED',dict(top=196,acc=.72,hnd=.78,trk=.66),{},{}),
 ('cruiser',1,16,'Power Cruiser 1250','CRUISER',dict(top=225,acc=.84,hnd=.62,trk=.5),{'rake':33,'box':[[0.0,0.6,0.43,0.7]]},{}),
 ('patrol',4,14,'Patrol 1800','TOURER',dict(top=190,acc=.6,hnd=.55,trk=.38),{},{}),
 ('fatscoot',7,13,'Fat Scooter 50','SCOOTER',dict(top=96,acc=.42,hnd=.9,trk=.7),{},{}),
 ('retroscoot',8,12,'Retro Scooter 125','SCOOTER',dict(top=112,acc=.46,hnd=.86,trk=.56),{},{}),
]
def q16(a,s):return np.clip(np.round(a*s),-32767,32767).astype(np.int16)
out=[];prev=[]
for bid,k,tw,name,kind,st,ov,aov in BIKES:
  m=L==k;tri,part,info=bikeseg.segment(T[m],ov=ov);col=C[m];pid=PID[m]
  uniq=set(PID[L==k])-set(PID[L==tw]);paint=np.isin(pid,list(uniq))
  alt=None
  if uniq:
    tm=(L==tw)&np.isin(PID,list(set(PID[L==tw])-set(PID[L==k])));alt=C[tm].mean(0)
    base=col[paint].mean(0)
  else: base=None
  tri=tri*SC
  fw=np.array(info['fw'][0])*SC;rw=np.array(info['rw'][0])*SC;rf=info['fw'][1]*SC;rr=info['rw'][1]*SC;piv=np.array(info['piv'])*SC;ax=np.array([0,info['axis'][1],info['axis'][0]])
  # anchors: seat top, grips, pegs (bike coords, metres; +z forward, y up from the ground)
  P=tri.reshape(-1,3);bodyv=tri[part==0].reshape(-1,3);stv=tri[part==1].reshape(-1,3)
  wb=fw[2]-rw[2];zs=rw[2]+wb*.38
  sel=bodyv[(np.abs(bodyv[:,0])<.06)&(np.abs(bodyv[:,2]-zs)<wb*.12)];seat=[0,float(sel[:,1].max()) if len(sel) else .8,float(zs)]
  grip=None
  if len(stv):
    ax_=np.abs(stv[:,0]);hi=stv[:,1]>fw[1]+rf*1.2;cand=stv[hi&(ax_>.18)]
    if len(cand):
      # grips: the lowest wide cluster (mirrors sit above the bars)
      yb=np.percentile(cand[:,1],30);gc=cand[np.abs(cand[:,1]-yb)<.06]
      w=np.percentile(np.abs(gc[:,0]),80);gg=gc[np.abs(np.abs(gc[:,0])-w)<.05]
      grip=[float(w),float(gg[:,1].mean()),float(gg[:,2].mean())]
  if grip is None: grip=[.33,seat[1]+.25,float(piv[2]-.12)]
  peg=[.17,float(rw[1]+.04),float(rw[2]+wb*.42)]
  if kind=='SCOOTER': peg=[.14,float(fw[1]*.55+.05),float(rw[2]+wb*.62)]
  for kk,vv in aov.items(): {'seat':seat,'grip':grip,'peg':peg}[kk][:]=vv
  # palette
  ci=np.clip(np.round(col*63),0,63).astype(int);key=ci[:,0]*4096+ci[:,1]*64+ci[:,2];key=np.where(paint,-1,key)
  ukeys,inv=np.unique(key,return_inverse=True);pal=[]
  for u in ukeys:
    if u==-1: pal.append([-1,-1,-1])
    else: pal.append([int(u//4096),int(u//64%64),int(u%64)])
  parts={}
  for pi,pn in enumerate(['body','steer','fw','rw']):
    s=part==pi
    if not s.any(): continue
    t=tri[s].copy()
    if pn=='steer': t=t-piv
    if pn=='fw': t=t-fw
    if pn=='rw': t=t-rw
    v=np.round(t.reshape(-1,3)*15000).astype(np.int64);uv_,iv=np.unique(v,axis=0,return_inverse=True)
    pos=q16(uv_.astype(np.float64),1)
    idx=iv.ravel().astype(np.uint32)
    parts[pn]=dict(n=int(len(uv_)),pos=base64.b64encode(pos.tobytes()).decode(),idx=base64.b64encode((idx.astype(np.uint16) if len(uv_)<65536 else idx).tobytes()).decode(),i32=int(len(uv_)>=65536),
                   col=base64.b64encode(inv[s].astype(np.uint8).tobytes()).decode())
  e=dict(id=bid,name=name,kind=kind,stats=st,pal=pal,paint=(l2s(base).round(3).tolist() if False else (base.round(3).tolist() if base is not None else None)),alt=(alt.round(3).tolist() if alt is not None else None),
    fw=fw.round(4).tolist(),rw=rw.round(4).tolist(),rf=round(rf,4),rr=round(rr,4),piv=piv.round(4).tolist(),axis=ax.round(4).tolist(),seat=[round(x,4) for x in seat],grip=[round(x,4) for x in grip],peg=[round(x,4) for x in peg],
    len=round(float(P[:,2].max()-P[:,2].min()),3),h=round(float(P[:,1].max()),3),faces=int(len(tri)),parts=parts)
  out.append(e);print(bid,len(tri),'faces','pal',len(pal),'seat',e['seat'],'grip',e['grip'],'paint',e['paint'],'alt',e['alt'])
  if len(sys.argv)>5: prev.append(dict(k=bid,pos=tri.reshape(-1).round(4).tolist(),col=(np.where(paint[:,None],np.array([1,0,1]),col)*.5+np.array([[1,1,1],[1,.1,.1],[.1,.4,1],[.1,.9,.2]])[part]*.5).round(3).tolist(),info=dict(e,parts=None)))
blob=gzip.compress(json.dumps(dict(v=1,bikes=out),separators=(',',':')).encode(),9);open(sys.argv[4],'wb').write(blob);print('wrote',sys.argv[4],len(blob))
if len(sys.argv)>5: json.dump(prev,open(sys.argv[5],'w'))
