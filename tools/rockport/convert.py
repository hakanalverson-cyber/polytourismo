# polyize: colour rules, tile, weld, decimate, recolour, palette; writes pack + preview
import sys,numpy as np,pyfqmr,time,json,struct
from scipy.spatial import cKDTree
D,OUT=sys.argv[1],sys.argv[2]
SX,SZ=2200.,6900.; TILE=256; WXZ=10240
RAT={0:.45,1:.6,2:.3,3:.45,4:.5,5:.65}
AGG={0:6,1:4,2:6,3:5,4:6,5:5}
P=[];C=[];K=[];O=[];X=[];R=[]
for i in range(1,14):
    z=np.load(f'{D}/p{i}.npz'); P.append(z['P']);C.append(z['C']);K.append(z['K']);O.append(z['O'].astype(np.int64)+i*100000);X.append(z['X']);R.append(z['R'])
P=np.concatenate(P).astype(np.float64);C=np.concatenate(C).astype(np.float32)/255;K=np.concatenate(K);O=np.concatenate(O);X=np.concatenate(X);R=np.concatenate(R)
P[:,:,0]+=SX;P[:,:,2]+=SZ
cen=P.mean(1); ok=(cen[:,0]>0)&(cen[:,0]<WXZ)&(cen[:,2]>0)&(cen[:,2]<WXZ)&(cen[:,1]>-60)&(cen[:,1]<900)
P,C,K,O,X,R,cen=P[ok],C[ok],K[ok],O[ok],X[ok],R[ok],cen[ok]
print('faces',len(P))
sys.path.insert(0,__file__.rsplit('/',1)[0]); from close import close
nP,nO=close(P,O,K)
if len(nP):
    n=len(nP);P=np.concatenate([P,nP]);C=np.concatenate([C,np.zeros((n,3,3) if C.ndim==3 else (n,3),np.float32)]);K=np.concatenate([K,np.ones(n,K.dtype)]);O=np.concatenate([O,nO]);X=np.concatenate([X,np.zeros(n,bool)]);R=np.concatenate([R,np.zeros(n,bool)]);cen=P.mean(1)
nrm=np.cross(P[:,1]-P[:,0],P[:,2]-P[:,0]); nl=np.linalg.norm(nrm,axis=1)+1e-9; ny=np.abs(nrm[:,1])/nl
def hx(h): return np.array([(h>>16&255)/255,(h>>8&255)/255,(h&255)/255],np.float32)
H=lambda o,s: ((o*2654435761+s*40503)%1000003)/1000003.
TALL=np.array([hx(c) for c in [0x7f9fb8,0x5f9ea0,0xd8b98a,0xeeeeea,0x56677a,0x9a7b5a,0xb9c7d3,0x8a6f9e]])
MID=np.array([hx(c) for c in [0xb5573f,0xcf7a45,0xf0e0bd,0x9db08c,0xe0ac45,0x9cc3d9,0xe6a6a2,0xc9c2b4,0x7b8fa6]])
LOW=np.array([hx(c) for c in [0xf2d77a,0xa8d8b9,0xf29e7e,0x8ec3e6,0xf4f0e6,0xc6acd9,0xcf5a52,0xe9c08f]])
ROOF=np.array([hx(c) for c in [0x4a4f57,0xb5583a,0x5f9b84,0x51627a,0x6d5345,0x8e3b30,0x3f4a3c]])
CONC=np.array([hx(c) for c in [0xc9c6bd,0xb3aea3,0xd9d3c3,0x9c9a95,0xa58d6c]])
# object heights (building class)
uo,oi=np.unique(O,return_inverse=True)
ymn=np.full(len(uo),1e9);ymx=np.full(len(uo),-1e9);np.minimum.at(ymn,oi,P[:,:,1].min(1));np.maximum.at(ymx,oi,P[:,:,1].max(1));oh_=(ymx-ymn)[oi]
u=~X
oh=H(O,1); oh2=H(O,7)
pick=lambda pal,h:pal[(h*len(pal)).astype(int)%len(pal)]
cB=np.where((oh_>35)[:,None],pick(TALL,oh),np.where((oh_>12)[:,None],pick(MID,oh),pick(LOW,oh)))
cR=pick(ROOF,oh2)
roof=ny>.7
# buildings: walls from the class palette (textured walls keep a little of their texture), roofs from the roof palette
gC=C.mean(1,keepdims=True);Ctex=np.clip(gC+(C-gC)*1.6,0,1)
bwall=np.where(u[:,None],cB,cB*.6+Ctex*.4)
bcol=np.where(roof[:,None],np.where(u[:,None],cR,cR*.55+Ctex*.45),bwall)
other=np.where(u[:,None],pick(CONC,oh2),Ctex)
cu=np.where((K==1)[:,None],bcol,other)
# terrain / panorama hills: grass to olive by height, rock when steep
h=cen[:,1]; t=np.clip(h/400,0,1)[:,None]
hill=hx(0x6d9a45)*(1-t)+hx(0x8a8f55)*t; rock=hx(0x8f8676)
hill=np.where((ny<.6)[:,None],rock,hill)
C=np.where(((K==0)|(K==4))[:,None]&u[:,None],hill,cu)
PAVE=np.array([hx(x) for x in [0xbdb6a8,0xaea89c,0xc8c0ae,0xa29d93]])
C=np.where((K==4)[:,None],np.clip(C,0,1)*.35+hill*.65,C)
# terrain textures: lift the greens so parks read as parks
tg=(K==0)&X; C=np.where(tg[:,None],np.clip(Ctex**.85*1.08,0,1),C)
# roads: their own category (physics + map), asphalt kept a touch darker and neutral
K=np.where(R,5,K)
asph=hx(0x40434c); C=np.where((K==5)[:,None]&(ny>.6)[:,None],asph*.7+np.clip(C,0,1)*.3,C)
# ---- ground fill: 8 m grid under everything; lowest up-facing terrain/road surface per cell, holes filled from the nearest known ground, sloping to the sea far away
from scipy import ndimage
GC=8; GN=WXZ//GC+1
up=((K==0)|(K==5))&(ny>.5)
tri=P[up]; area=nl[up]*.5; ns=np.clip((area/24).astype(int),1,400)
rep=np.repeat(np.arange(len(tri)),ns); r1=rng_=np.random.default_rng(5)
a=r1.random(len(rep)); b=r1.random(len(rep)); f=a+b>1; a[f]=1-a[f]; b[f]=1-b[f]
pts=tri[rep,0]+(tri[rep,1]-tri[rep,0])*a[:,None]+(tri[rep,2]-tri[rep,0])*b[:,None]
pts=np.concatenate([pts,tri.reshape(-1,3)])
gi=np.clip(np.round(pts[:,0]/GC).astype(int),0,GN-1); gj=np.clip(np.round(pts[:,2]/GC).astype(int),0,GN-1)
HG=np.full((GN,GN),1e9); np.minimum.at(HG,(gj,gi),pts[:,1])
known=HG<1e8
dist,(ij,ii)=ndimage.distance_transform_edt(~known,return_indices=True)
Hn=HG[ij,ii]
# smooth the filled part (keep known cells), a few relaxation passes
Hf=Hn.copy()
for it in range(40):
    Hs=ndimage.uniform_filter(Hf,5,mode='nearest'); Hf=np.where(known,Hn,Hs)
d=dist*GC; sea=-7.0
t=np.clip((d-140)/360,0,1); t=t*t*(3-2*t)
Hf=Hf*(1-t)+sea*t
Hf=np.where(known,Hn-0.6,Hf-0.25)
print('fill grid',GN,'known',known.mean())
# urban index: how built-up the ground around each cell is (buildings, roads); the fill and plain terrain turn to pavement there
occ=np.zeros((GN,GN));bi_=np.clip(np.round(cen[:,0]/GC).astype(int),0,GN-1);bj_=np.clip(np.round(cen[:,2]/GC).astype(int),0,GN-1)
np.maximum.at(occ,(bj_[K==1],bi_[K==1]),1.);np.maximum.at(occ,(bj_[R],bi_[R]),.5)
URB=np.clip(ndimage.gaussian_filter(occ,2.2)*3.2-.25,0,1)
# panorama cards inside the city (they stand across streets): keep only the ones far out from the real ground
fi=np.clip(np.round(cen[:,0]/GC).astype(int),0,GN-1);fj=np.clip(np.round(cen[:,2]/GC).astype(int),0,GN-1)
km=~((K==4)&((dist[fj,fi]*GC<700)|(ymn[oi]>30)))
print('panorama faces dropped',int((~km).sum()))
uf=URB[fj,fi][:,None]*(((K==0)&~X&(ny>.6)))[:,None];C=C*(1-uf)+pick(PAVE,H(O,3))*uf
P,C,K,O,X,R,cen,nl,ny=P[km],C[km],K[km],O[km],X[km],R[km],cen[km],nl[km],ny[km]
# palette: k-means 192 on a sample
from scipy.cluster.vq import kmeans2
rng=np.random.default_rng(1); smp=C[rng.choice(len(C),200000,replace=False)]
pal,_=kmeans2(smp.astype(np.float64),192,minit='++',seed=3,iter=12)
pal=np.clip(pal,0,1)
tree=cKDTree(pal); _,ci=tree.query(C); ci=ci.astype(np.uint8)
# tiles
ti=(cen[:,0]//TILE).astype(int); tj=(cen[:,2]//TILE).astype(int); NT=WXZ//TILE
key=(tj*NT+ti)*8+K.astype(np.int64)
order=np.argsort(key,kind='stable'); ks=key[order]
bounds=np.flatnonzero(np.diff(ks))+1; starts=np.r_[0,bounds]; ends=np.r_[bounds,len(ks)]
meshes=[]; tot=0; t0=time.time()
for s,e in zip(starts,ends):
    idx=order[s:e]; k=int(ks[s]); cat=k%8; tile=k//8; tx,tz=(tile%NT)*TILE,(tile//NT)*TILE
    tri=P[idx]; q=np.round(tri.reshape(-1,3)*50).astype(np.int64)
    uq,inv=np.unique(q,axis=0,return_inverse=True); V=uq/50.; F=inv.reshape(-1,3)
    F=F[(F[:,0]!=F[:,1])&(F[:,1]!=F[:,2])&(F[:,0]!=F[:,2])]
    src_c=tri.mean(1); src_ci=ci[idx]
    n=len(F)
    if n>80:
        sm=pyfqmr.Simplify(); sm.setMesh(V,F); sm.simplify_mesh(target_count=max(40,int(n*RAT[cat])),aggressiveness=AGG[cat],preserve_border=cat not in (2,3),verbose=False)
        V,F,_=sm.getMesh()
    if len(F)==0: continue
    fc=V[F].mean(1); _,nn=cKDTree(src_c).query(fc); fcol=src_ci[nn]
    meshes.append((tile,cat,tx,tz,V.astype(np.float32),F.astype(np.uint32),fcol)); tot+=len(F)
print('meshes',len(meshes),'tris',tot,'secs',round(time.time()-t0))
# pack: header json + binary. positions int16 (x,z rel tile in 1/64 m; y in 1/32 m), indices uint16, colour per face uint8
blob=bytearray(); meta=[]
for tile,cat,tx,tz,V,F,fc in meshes:
    if len(V)>65535: raise SystemExit('too many verts')
    qv=np.empty((len(V),3),np.int16); qv[:,0]=np.clip(np.round((V[:,0]-tx)*64),-32768,32767); qv[:,1]=np.clip(np.round(V[:,1]*32),-32768,32767); qv[:,2]=np.clip(np.round((V[:,2]-tz)*64),-32768,32767)
    o=len(blob); blob+=qv.tobytes(); blob+=F.astype(np.uint16).tobytes();
    if len(blob)%2: blob+=b'\0'
    blob+=fc.astype(np.uint8).tobytes()
    while len(blob)%4: blob+=b'\0'
    meta.append([int(tile),int(cat),int(tx),int(tz),len(V),len(F),o])
Hq=np.clip(np.round(Hf*8),-32768,32767).astype(np.int16); ground_off=len(blob); blob+=Hq.tobytes()
urb_off=len(blob); blob+=np.round(URB*255).astype(np.uint8).tobytes()
while len(blob)%4: blob+=b'\0'
json.dump({'gc':GC,'gn':int(GN),'goff':ground_off,'uoff':urb_off,'gscale':8,'tile':TILE,'w':WXZ,'shift':[SX,SZ],'pal':[[round(float(c),4) for c in p] for p in pal],'m':meta},open(OUT+'.json','w'),separators=(',',':'))
open(OUT+'.bin','wb').write(blob)
# preview soup
pos=[];col=[]
for tile,cat,tx,tz,V,F,fc in meshes: pos.append(V[F].reshape(-1,3)); col.append(np.repeat((pal[fc]*255).astype(np.uint8),3,0))
np.concatenate(pos).astype(np.float32).tofile(OUT+'_prev.pos'); np.concatenate(col).tofile(OUT+'_prev.col')
print('bin MB',len(blob)/1e6)
