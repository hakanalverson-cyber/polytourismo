# polyize: colour rules, tile, weld, decimate, recolour, palette; writes pack + preview
import sys,numpy as np,pyfqmr,time,json,struct
from scipy.spatial import cKDTree
D,OUT=sys.argv[1],sys.argv[2]
SX,SZ=2200.,6900.; TILE=256; WXZ=10240
RAT={0:.5,1:.6,2:.6,3:.8,4:.5,5:.7}
AGG={0:6,1:4,2:6,3:5,4:6,5:5}
P=[];C=[];K=[];O=[];X=[];R=[];U=[];TI=[]
ATL=json.load(open(OUT.rsplit('/',1)[0]+'/atlas.json'));TNAME=sorted(ATL['r']);TIDX={n:i for i,n in enumerate(TNAME)}
# pattern strength of each texture (luminance spread): plain surfaces only borrow plain textures, never signs or chevrons
from PIL import Image as _I
TEXV=np.array([float(np.asarray(_I.open(D+'/tex/'+n).convert('L').resize((32,32)),np.float32).std()/255) for n in TNAME])
for i in range(1,14):
    z=np.load(f'{D}/p{i}.npz'); P.append(z['P']);C.append(z['C']);K.append(z['K']);O.append(z['O'].astype(np.int64)+i*100000);X.append(z['X']);R.append(z['R']);U.append(z['U']);_m=np.array([TIDX[n] for n in z['TN']]+[-1],np.int32);TI.append(_m[np.where(z['TI']>=0,z['TI'],len(z['TN']))])
P=np.concatenate(P).astype(np.float64);C=np.concatenate(C).astype(np.float32)/255;K=np.concatenate(K);O=np.concatenate(O);X=np.concatenate(X);R=np.concatenate(R);U=np.concatenate(U).astype(np.float32);TI=np.concatenate(TI)
P[:,:,0]+=SX;P[:,:,2]+=SZ
cen=P.mean(1); ok=(cen[:,0]>0)&(cen[:,0]<WXZ)&(cen[:,2]>0)&(cen[:,2]<WXZ)&(cen[:,1]>-60)&(cen[:,1]<900)
P,C,K,O,X,R,cen,U,TI=P[ok],C[ok],K[ok],O[ok],X[ok],R[ok],cen[ok],U[ok],TI[ok]
print('faces',len(P))
# the garage lot (pack.py writes it): props, fences and barriers on it or across its drive go
import os
if os.path.exists(D+'/site.json'):
    st_=json.load(open(D+'/site.json'));c_,s_=np.cos(st_['ry']),np.sin(st_['ry']);dx_=cen[:,0]-st_['x'];dz_=cen[:,2]-st_['z']
    lx_=dx_*c_-dz_*s_;lz_=dx_*s_+dz_*c_;x0,x1,z0,z1=st_['rect']
    gone=((K==2)|(K==3))&(lx_>x0)&(lx_<x1)&(lz_>z0)&(lz_<z1)&(cen[:,1]>-60)
    print('props off the garage lot',int(gone.sum()))
    P,C,K,O,X,R,cen,U,TI=P[~gone],C[~gone],K[~gone],O[~gone],X[~gone],R[~gone],cen[~gone],U[~gone],TI[~gone]
sys.path.insert(0,__file__.rsplit('/',1)[0]); from close import close
from scipy import ndimage
# GENB=x,z,r: buildings inside the circle become our own generated buildings (K=6)
GCOL={}
if os.environ.get('GENB'):
    from genb import gen
    _gx,_gz,_gr=[float(v) for v in os.environ['GENB'].split(',')]
    gP,gO,_inr,GCOL=gen(P,O,K,_gx,_gz,_gr)
    kp=~_inr;P,C,K,O,X,R,cen,U,TI=P[kp],C[kp],K[kp],O[kp],X[kp],R[kp],cen[kp],U[kp],TI[kp]
    n=len(gP);P=np.concatenate([P,gP]);C=np.concatenate([C,np.zeros((n,3),np.float32)]);K=np.concatenate([K,np.full(n,6,K.dtype)]);O=np.concatenate([O,gO]);X=np.concatenate([X,np.zeros(n,bool)]);R=np.concatenate([R,np.zeros(n,bool)]);U=np.concatenate([U,np.zeros((n,3,2),np.float32)]);TI=np.concatenate([TI,np.full(n,-1,TI.dtype)]);cen=P.mean(1)
nP,nO=close(P,O,K)
import os
if os.path.exists(D+'/extra.npz'):
    xe=np.load(D+'/extra.npz')['P'].astype(np.float64);ne=len(xe)
    P=np.concatenate([P,xe]);C=np.concatenate([C,np.tile(np.array([[.25,.26,.29]],np.float32),(ne,1))]);K=np.concatenate([K,np.zeros(ne,K.dtype)]);O=np.concatenate([O,np.full(ne,9999999,np.int64)]);X=np.concatenate([X,np.ones(ne,bool)]);R=np.concatenate([R,np.ones(ne,bool)]);U=np.concatenate([U,np.zeros((ne,3,2),np.float32)]);TI=np.concatenate([TI,np.full(ne,-1,np.int32)]);cen=P.mean(1)
    print('joined road tris',ne)
if len(nP):
    n=len(nP);P=np.concatenate([P,nP]);C=np.concatenate([C,np.zeros((n,3,3) if C.ndim==3 else (n,3),np.float32)]);K=np.concatenate([K,np.ones(n,K.dtype)]);O=np.concatenate([O,nO]);X=np.concatenate([X,np.zeros(n,bool)]);R=np.concatenate([R,np.zeros(n,bool)]);U=np.concatenate([U,np.zeros((n,3,2),np.float32)]);TI=np.concatenate([TI,np.full(n,-1,np.int32)]);cen=P.mean(1)
nrm=np.cross(P[:,1]-P[:,0],P[:,2]-P[:,0]); nl=np.linalg.norm(nrm,axis=1)+1e-9; ny=np.abs(nrm[:,1])/nl
def hx(h): return np.array([(h>>16&255)/255,(h>>8&255)/255,(h&255)/255],np.float32)
H=lambda o,s: ((o*2654435761+s*40503)%1000003)/1000003.
# ---- colours: realistic, slightly gritty tones (Hakan: "not every building pastel... on the more realistic side, just not flat colours")
WALLP=np.array([hx(c) for c in [0x8e4a3a,0x6b3a2e,0xa45c42,0xc2a77f,0xd6c7a6,0xb5b2aa,0x7d7b77,0xe2ded5,0x5d7486,0x4f7a7a,0x7a5a3f,0xd9c48a,0x55606b,0x8c977a,0xb06a48,0x9a9fa6,0x3f4b57,0xcbb89a]])
ROOF=np.array([hx(c) for c in [0x3d3f42,0x4b4a47,0x6e6a62,0x4a4f57,0x8e4b35,0x5c4a3e,0x5e8a78,0x8d8a83,0x2f3236]])
CONC=np.array([hx(c) for c in [0xa9a59b,0x948f86,0xbab3a3,0x85827c,0x9a8a70]])
uo,oi=np.unique(O,return_inverse=True)
ymn=np.full(len(uo),1e9);ymx=np.full(len(uo),-1e9);np.minimum.at(ymn,oi,P[:,:,1].min(1));np.maximum.at(ymx,oi,P[:,:,1].max(1));oh_=(ymx-ymn)[oi]
u=~X
oh=H(O,1); oh2=H(O,7)
pick=lambda pal,h:pal[(h*len(pal)).astype(int)%len(pal)]
roof=ny>.7
gC=C.mean(1,keepdims=True);Ctex=np.clip(gC+(C-gC)*1.35,0,1)
# per object: mean colour of its textured faces (walls only for buildings)
def omean(m):
    s=np.zeros((len(uo),3));n=np.zeros(len(uo));np.add.at(s,oi[m],C[m]);np.add.at(n,oi[m],1);return s/np.maximum(n,1)[:,None],n
wm,wn=omean((K==1)&X&~roof)
# building wall colour: the object's own colour pulled onto the nearest realistic tone; objects with no texture pick one
d=((wm[:,None,:]-WALLP[None])**2).sum(-1);near=WALLP[d.argmin(1)]
hp=pick(WALLP,H(uo,1))
obj_wall=np.where((wn>0)[:,None],near*.6+wm*.4,hp)
# a little per-face life from the texture brightness (not flat), kept coherent per building
lum=C.mean(1);ol=np.zeros(len(uo));np.add.at(ol,oi[(K==1)&X],lum[(K==1)&X]);ol/=np.maximum(np.bincount(oi[(K==1)&X],minlength=len(uo)),1)
var=np.where(X&(K==1),np.clip((lum-ol[oi])*.35,-.07,.07),0)[:,None]
bwall=np.clip(obj_wall[oi]*(1+var*2.2),0,1)
cR=pick(ROOF,oh2)
bcol=np.where(roof[:,None],np.where(u[:,None],cR,cR*.7+Ctex*.3),bwall)
# props / walls / fences: every object snapped to its own 3 main colours so it reads as one thing, contrast lifted
from scipy.cluster.vq import kmeans2 as _km
other=np.where(u[:,None],pick(CONC,oh2),Ctex).astype(np.float64)
pm=np.flatnonzero(((K==2)|(K==3))&X)
if len(pm):
    po=oi[pm];order_=np.argsort(po,kind='stable');pm=pm[order_];po=po[order_];cut=np.flatnonzero(np.diff(po))+1
    for g in np.split(pm,cut):
        cg=other[g]
        if len(g)>=12:
            try:
                cent,lab=_km(cg,3,minit='++',seed=1,iter=6);cg=cent[lab]
            except Exception: pass
        m_=cg.mean(0);cg=np.clip(m_+(cg-m_)*1.25,0,1)
        other[g]=cg
cu=np.where((K==1)[:,None],bcol,other)
# terrain / panorama hills: grass to olive by height, rock when steep
h=cen[:,1]; t=np.clip(h/400,0,1)[:,None]
hill=hx(0x5f8a3e)*(1-t)+hx(0x7d8450)*t; rock=hx(0x857c6c)
hill=np.where((ny<.6)[:,None],rock,hill)
C=np.where(((K==0)|(K==4))[:,None]&u[:,None],hill,cu)
PAVE=np.array([hx(x) for x in [0xa8a296,0x9b968b,0xb3ab9a,0x8f8a82]])
C=np.where((K==4)[:,None],np.clip(C,0,1)*.35+hill*.65,C)
# terrain textures: keep them, greens a touch richer
tg=(K==0)&X; C=np.where(tg[:,None],np.clip(Ctex**.92*1.04,0,1),C)
# grass: realistic, a bit muted and darker (not lime), with broad patches so fields are never one flat colour
FB=lambda c:(.5*np.sin(c[:,0]*.021+1.3)*np.sin(c[:,2]*.017+.4)+.3*np.sin(c[:,0]*.057+c[:,2]*.043)+.2*np.sin(c[:,0]*.11-c[:,2]*.13))
fb=FB(cen)[:,None]
gd=((K==0)|(K==4))&(C[:,1]>C[:,0]*1.02)&(C[:,1]>C[:,2]*1.1)
Lg=C.mean(1,keepdims=True);gq=np.clip((Lg+(C-Lg)*.72)*.84*(1+.08*fb)+np.array([.012,.004,-.01],np.float32),0,1)
C=np.where(gd[:,None],gq,C)
# props / walls: nothing pitch black (unlit textures read as holes)
lp=C.mean(1);dk=((K==2)|(K==3))&(lp<.13);C=np.where(dk[:,None],np.clip(C*(.13/np.maximum(lp,.02))[:,None],0,1),C)
# roads: their own category (physics + map), asphalt a touch darker and neutral
K=np.where(R,5,K)
asph=hx(0x3e4148); C=np.where((K==5)[:,None]&(ny>.6)[:,None],asph*.72+np.clip(C,0,1)*.28,C)
# grass under the road: terrain faces lying just under a road surface show through it (z-fighting) -> drop them
v_=C.max(1);s_=(C.max(1)-C.min(1))/np.maximum(v_,1e-3)
isr=((K==5)|((K==0)&X&(s_<.18)&(v_>.15)&(v_<.55)))&(ny>.8)
RCl=2;RNl=WXZ//RCl
RY=np.full((RNl,RNl),-1e9,np.float32)
rt=P[isr];_rng=np.random.default_rng(9);ar_=nl[isr]*.5;ns_=np.clip((ar_/1.).astype(int),1,3000);rp_=np.repeat(np.arange(len(rt)),ns_)
aa=_rng.random(len(rp_));bb_=_rng.random(len(rp_));ff=aa+bb_>1;aa[ff]=1-aa[ff];bb_[ff]=1-bb_[ff]
pp=np.concatenate([rt[rp_,0]+(rt[rp_,1]-rt[rp_,0])*aa[:,None]+(rt[rp_,2]-rt[rp_,0])*bb_[:,None],rt.reshape(-1,3)])
np.maximum.at(RY,(np.clip((pp[:,2]/RCl).astype(int),0,RNl-1),np.clip((pp[:,0]/RCl).astype(int),0,RNl-1)),pp[:,1].astype(np.float32))
cand=np.flatnonzero((K==0)&~isr&(ny>.5)&(C[:,1]>C[:,0]*1.02)&(C[:,1]>C[:,2]*1.1))  # only grass: never road decks next to a barrier top
ok_=np.ones(len(cand),bool)
for k in range(3):
    vx=P[cand,k];ry=RY[np.clip((vx[:,2]/RCl).astype(int),0,RNl-1),np.clip((vx[:,0]/RCl).astype(int),0,RNl-1)]
    ok_&=(ry>vx[:,1]-.15)&(ry<vx[:,1]+.9)
dropg=np.zeros(len(P),bool);dropg[cand[ok_]]=True
print('grass faces under roads dropped',int(dropg.sum()))
# road points every ~2 m across the full width of every traced road (each level keeps its own height)
_RJ=json.load(open(OUT+'_roads.json'));_rp=[]
for _r in _RJ:
    _x=np.array(_r['x']);_z=np.array(_r['z']);_y=np.array(_r['y']);_n=len(_x)
    if _n<2:continue
    _L=np.hypot(np.diff(_x),np.diff(_z));_c=np.r_[0,np.cumsum(_L)];_t=np.arange(0,_c[-1]+.01,2.)
    _xi=np.interp(_t,_c,_x);_zi=np.interp(_t,_c,_z);_yi=np.interp(_t,_c,_y);_dx=np.gradient(_xi);_dz=np.gradient(_zi);_l=np.hypot(_dx,_dz)+1e-9;_nx=-_dz/_l;_nz=_dx/_l
    for _o in np.arange(-max(_r['hw']-1.2,0),max(_r['hw']-1.2,0)+.01,2.):_rp.append(np.stack([_xi+_nx*_o,_zi+_nz*_o,_yi],1))
RDP=np.concatenate(_rp);print('road check points',len(RDP))
# ground in the way: terrain faces (not road, not bridges) lying just above a road -> dropped (the fill ground below is kept under the road)
_kd=cKDTree(RDP[:,:2]);_tf=np.flatnonzero((K==0)&~R&~dropg&(ny>.3))
_pts=np.concatenate([cen[_tf][:,None,:],P[_tf]],1).reshape(-1,3);_nb=_kd.query_ball_point(_pts[:,[0,2]],1.1)
_bad=np.zeros(len(_pts),bool)
for _i,_l in enumerate(_nb):
    if _l:
        _d=_pts[_i,1]-RDP[_l,2]
        if ((_d>.5)&(_d<3.5)).any():_bad[_i]=True  # kerbs and pavements (<0.5 m) stay
_bf=_bad.reshape(-1,4).any(1);dropg[_tf[_bf]]=True;print('terrain faces over roads dropped',int(_bf.sum()))
# GENB streets: clear the old street clutter in the region, keep guard rails by the roads; street trees and lamps in rhythm
LAMPC=None
if os.environ.get('GENB'):
    _rng_=np.random.default_rng(5);_kdr=cKDTree(RDP[:,:2]);inreg=np.hypot(cen[:,0]-_gx,cen[:,2]-_gz)<_gr
    _d,_ii=_kdr.query(cen[:,[0,2]],distance_upper_bound=3.)
    nearroad=(_d<3.)&(np.abs(cen[:,1]-RDP[np.minimum(_ii,len(RDP)-1),2])<3.5)
    # walls by the road stay only when low (curbs, rails); tall concrete blocks go
    # walls in the region stay only when they are low rails by the road (own height under 1.4 m); retaining and planter walls go
    _top=np.full(O.max()+1,-1e9);_bot=np.full(O.max()+1,1e9);_w2=inreg&(K==2)
    np.maximum.at(_top,O[_w2],P[_w2,:,1].max(1));np.minimum.at(_bot,O[_w2],P[_w2,:,1].min(1))
    nearroad&=(_top[O]-_bot[O])<1.4
    clut=inreg&((K==3)|((K==2)&~nearroad));dropg|=clut;print('street clutter removed',int(clut.sum()))
    # building raster of our generated buildings (1 m) so nothing is placed inside them
    _b6=P[K==6].reshape(-1,3);BM=np.zeros((int(2*_gr)+40,int(2*_gr)+40),bool);_ox,_oz=_gx-_gr-20,_gz-_gr-20
    for _t in P[(K==6)&(ny<.3)]:
        for _w in np.linspace(0,1,12):
            _p=_t[0]+(_t[1]-_t[0])*_w;_i=int(_p[0]-_ox);_j=int(_p[2]-_oz)
            if 0<=_i<BM.shape[1] and 0<=_j<BM.shape[0]:BM[_j,_i]=True
    BM=ndimage.binary_fill_holes(ndimage.binary_closing(BM,iterations=2));BM=ndimage.binary_dilation(BM,iterations=2)
    # every road's centre line, sampled each metre with its half width: a spot is free only if it is clear of all of them
    _cp=[];_ch=[]
    for _r in _RJ:
        _x=np.array(_r['x']);_z=np.array(_r['z'])
        if len(_x)<2 or np.hypot(_x-_gx,_z-_gz).min()>_gr+60:continue
        _c=np.r_[0,np.cumsum(np.hypot(np.diff(_x),np.diff(_z)))];_t=np.arange(0,_c[-1],1.)
        _cp.append(np.stack([np.interp(_t,_c,_x),np.interp(_t,_c,_z)],1));_ch.append(np.full(len(_t),_r['hw']))
    _cp=np.concatenate(_cp);_ch=np.concatenate(_ch);_kc=cKDTree(_cp);_hwmax=_ch.max()
    # 0.5 m raster of the real road surfaces (flat road faces, the asphalt as drawn), so nothing stands on the tarmac itself
    RS=np.zeros((BM.shape[0]*2,BM.shape[1]*2),bool);_rf=np.flatnonzero((K==5)&(ny>.85)&inreg)
    for _t in P[_rf]:
        _a=_rng_.random((40,1));_b=_rng_.random((40,1));_f=(_a+_b)>1;_a[_f]=1-_a[_f];_b[_f]=1-_b[_f]
        _q=_t[0]+(_t[1]-_t[0])*_a+(_t[2]-_t[0])*_b;_i=((_q[:,0]-_ox)*2).astype(int);_j=((_q[:,2]-_oz)*2).astype(int);_k=(_i>=0)&(_j>=0)&(_i<RS.shape[1])&(_j<RS.shape[0]);RS[_j[_k],_i[_k]]=True
    RS=ndimage.binary_closing(RS,iterations=2)
    print('road surface cells',int(RS.sum()))
    def _free(x,z):
        _i=int((x-_ox)*2);_j=int((z-_oz)*2)
        if 0<=_i<RS.shape[1] and 0<=_j<RS.shape[0] and RS[max(_j-1,0):_j+2,max(_i-1,0):_i+2].any():return False
        i=int(x-_ox);j=int(z-_oz)
        if not(0<=i<BM.shape[1] and 0<=j<BM.shape[0]) or BM[j,i]:return False
        for q in _kc.query_ball_point([x,z],_hwmax+1.):
            if np.hypot(_cp[q,0]-x,_cp[q,1]-z)<_ch[q]+.8:return False   # never on any road (lanes, medians, junctions)
        return _kdr.query([x,z])[0]>1.6
    STREE=[];LP=[]
    for _r in _RJ:
        _x=np.array(_r['x']);_z=np.array(_r['z']);_y=np.array(_r['y'])
        if len(_x)<2 or np.hypot(_x-_gx,_z-_gz).min()>_gr:continue
        _L=np.hypot(np.diff(_x),np.diff(_z));_c=np.r_[0,np.cumsum(_L)]
        for _k,_t in enumerate(np.arange(6,_c[-1]-6,14.)):
            xi=np.interp(_t,_c,_x);zi=np.interp(_t,_c,_z);yi=np.interp(_t,_c,_y)
            if np.hypot(xi-_gx,zi-_gz)>_gr:continue
            _t2=min(_t+1,_c[-1]);dx=np.interp(_t2,_c,_x)-np.interp(_t2-1,_c,_x);dz=np.interp(_t2,_c,_z)-np.interp(_t2-1,_c,_z);l=np.hypot(dx,dz)+1e-9;nx,nz=-dz/l,dx/l
            for sd in(-1,1):
                ox_=xi+nx*sd*(_r['hw']+2.6);oz_=zi+nz*sd*(_r['hw']+2.6)
                if _k%2==0 and _free(ox_,oz_):STREE.append([float(ox_),float(yi),float(oz_)])
                lx=xi+nx*sd*(_r['hw']+1.1);lz=zi+nz*sd*(_r['hw']+1.1)
                if _k%2==(0 if sd<0 else 1) and _free(lx,lz):LP.append([lx,yi+.15,lz,-nx*sd,-nz*sd])
    json.dump(STREE,open(D+'/street_trees.json','w'));print('street trees',len(STREE),'lamps',len(LP))
    # lamps: pole, arm over the road, head (our own simple model)
    def _box(c,hw_,hh,hd,ux,uz):
        vx,vz=-uz,ux;out=[]
        cs=[[c[0]+ux*a*hw_+vx*b*hd,c[1]+e*hh,c[2]+uz*a*hw_+vz*b*hd] for a in(-1,1) for b in(-1,1) for e in(-1,1)]
        F=[(0,1,3,2),(4,6,7,5),(0,4,5,1),(2,3,7,6),(0,2,6,4),(1,5,7,3)]
        for f in F:out+=[[cs[f[0]],cs[f[1]],cs[f[2]]],[cs[f[0]],cs[f[2]],cs[f[3]]]]
        return out
    lP=[];lO=[]
    for x,y,z,ux,uz in LP:
        for tri in _box([x,y+3.6,z],.12,3.6,.12,ux,uz):lP.append(tri);lO.append(9100000)
        for tri in _box([x+ux*.9,y+7.1,z+uz*.9],.9,.07,.07,ux,uz):lP.append(tri);lO.append(9100000)
        for tri in _box([x+ux*1.7,y+6.95,z+uz*1.7],.35,.1,.18,ux,uz):lP.append(tri);lO.append(9100001)
    if lP:
        n=len(lP);lP=np.array(lP,np.float64);P=np.concatenate([P,lP]);C=np.concatenate([C,np.zeros((n,3),np.float32)]);K=np.concatenate([K,np.full(n,7,K.dtype)]);O=np.concatenate([O,np.array(lO)]);X=np.concatenate([X,np.zeros(n,bool)]);R=np.concatenate([R,np.zeros(n,bool)]);U=np.concatenate([U,np.zeros((n,3,2),np.float32)]);TI=np.concatenate([TI,np.full(n,-1,TI.dtype)]);cen=P.mean(1)
        _nr=np.cross(lP[:,1]-lP[:,0],lP[:,2]-lP[:,0]);_nl=np.linalg.norm(_nr,axis=1)+1e-9;nl=np.concatenate([nl,_nl]);ny=np.concatenate([ny,np.abs(_nr[:,1])/_nl]);oi=np.concatenate([oi,np.zeros(n,oi.dtype)]);dropg=np.concatenate([dropg,np.zeros(n,bool)])
        LAMPC=True
kk=~dropg
P,C,K,O,X,R,cen,nl,ny,oi,U,TI=P[kk],C[kk],K[kk],O[kk],X[kk],R[kk],cen[kk],nl[kk],ny[kk],oi[kk],U[kk],TI[kk]
# road surfaces: every flat ground face on a traced road at road height joins the road category, so it is decimated on its own
# (no big triangles mixing grass into the asphalt) and gets one neutral asphalt with only a faint texture life
RM_=np.unpackbits(np.load(OUT+'_roadmask.npy'))[:5120*5120].reshape(5120,5120).astype(bool)
cj_=np.clip((cen[:,2]/2).astype(int),0,5119);ci_=np.clip((cen[:,0]/2).astype(int),0,5119);ryc=RY[cj_,ci_]
onr=(K==0)&(ny>.8)&RM_[cj_,ci_]&(ryc>-1e8)&(np.abs(cen[:,1]-ryc)<1.0)
print('ground faces turned road',int(onr.sum()))
K=np.where(onr,5,K)
rf=(K==5)&(ny>.6);lt=C.mean(1);lm=np.median(lt[rf]) if rf.any() else .3
rv=np.clip((lt-lm)*.3,-.05,.05)+.025*FB(cen)
C=np.where(rf[:,None],np.clip(asph[None]*(1+rv)[:,None],0,1),C)
# ---- ground fill: 8 m grid under everything; lowest up-facing terrain/road surface per cell, holes filled from the nearest known ground, sloping to the sea far away
from scipy import ndimage
GC=8; GN=WXZ//GC+1
up=(K==0)&(ny>.5)&~R
tri=P[up]; area=nl[up]*.5; ns=np.clip((area/24).astype(int),1,400)
rep=np.repeat(np.arange(len(tri)),ns); r1=rng_=np.random.default_rng(5)
a=r1.random(len(rep)); b=r1.random(len(rep)); f=a+b>1; a[f]=1-a[f]; b[f]=1-b[f]
pts=tri[rep,0]+(tri[rep,1]-tri[rep,0])*a[:,None]+(tri[rep,2]-tri[rep,0])*b[:,None]
pts=np.concatenate([pts,tri.reshape(-1,3)])
gi=np.clip(np.round(pts[:,0]/GC).astype(int),0,GN-1); gj=np.clip(np.round(pts[:,2]/GC).astype(int),0,GN-1)
HG=np.full((GN,GN),1e9); np.minimum.at(HG,(gj,gi),pts[:,1])
# road surfaces on their own grid: used only where they are lower than the ground around them (roads in cuts, roads with no
# terrain under them at ground level); raised decks with nothing under them no longer pull the fill up into spikes
upr=((K==5)|R)&(ny>.5);trr=P[upr];arr=nl[upr]*.5;nsr=np.clip((arr/24).astype(int),1,400);repr_=np.repeat(np.arange(len(trr)),nsr)
a=r1.random(len(repr_)); b=r1.random(len(repr_)); f=a+b>1; a[f]=1-a[f]; b[f]=1-b[f]
pr=np.concatenate([trr[repr_,0]+(trr[repr_,1]-trr[repr_,0])*a[:,None]+(trr[repr_,2]-trr[repr_,0])*b[:,None],trr.reshape(-1,3)])
HRd=np.full((GN,GN),1e9);np.minimum.at(HRd,(np.clip(np.round(pr[:,2]/GC).astype(int),0,GN-1),np.clip(np.round(pr[:,0]/GC).astype(int),0,GN-1)),pr[:,1])
knownT=HG<1e8
dT,(ijT,iiT)=ndimage.distance_transform_edt(~knownT,return_indices=True);HT=HG[ijT,iiT].copy()
for it in range(40):
    HT=np.where(knownT,HG[ijT,iiT],ndimage.uniform_filter(HT,5,mode='nearest'))
HG=np.where(HRd<1e8,np.minimum(HRd,HT),HG)
# no cell above its neighbours: a cell whose only sample was a ramp side or a wall top made a spike
HG=np.where(HG<1e8,ndimage.minimum_filter(np.where(HG<1e8,HG,1e9),3,mode='nearest'),HG)
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
# the fill never rises above a road: every grid vertex around a road point sits 0.4 m under it
_gi=np.floor(RDP[:,0]/GC).astype(int);_gj=np.floor(RDP[:,2]/GC).astype(int);_c0=int((Hf>-1e8).sum())
_before=Hf.copy()
for _a in (0,1):
    for _b in (0,1):
        _ii=np.clip(_gi+_a,0,GN-1);_jj=np.clip(_gj+_b,0,GN-1);np.minimum.at(Hf,(_jj,_ii),RDP[:,2]-.4)
print('fill vertices lowered under roads',int((Hf<_before-.01).sum()))
print('fill grid',GN,'known',known.mean())
# urban index: how built-up the ground around each cell is (buildings, roads); the fill and plain terrain turn to pavement there
occ=np.zeros((GN,GN));bi_=np.clip(np.round(cen[:,0]/GC).astype(int),0,GN-1);bj_=np.clip(np.round(cen[:,2]/GC).astype(int),0,GN-1)
np.maximum.at(occ,(bj_[(K==1)|(K==6)],bi_[(K==1)|(K==6)]),1.);np.maximum.at(occ,(bj_[R],bi_[R]),.5)
URB=np.clip(ndimage.gaussian_filter(occ,2.2)*3.2-.25,0,1)
# panorama cards inside the city (they stand across streets): keep only the ones far out from the real ground
fi=np.clip(np.round(cen[:,0]/GC).astype(int),0,GN-1);fj=np.clip(np.round(cen[:,2]/GC).astype(int),0,GN-1)
km=~((K==4)&((dist[fj,fi]*GC<1500)|(ymn[oi]>30)))
print('panorama faces dropped',int((~km).sum()))
uf=URB[fj,fi][:,None]*(((K==0)&~X&(ny>.6)))[:,None];C=C*(1-uf)+pick(PAVE,H(O,3))*uf
P,C,K,O,X,R,cen,nl,ny,U,TI,oi=P[km],C[km],K[km],O[km],X[km],R[km],cen[km],nl[km],ny[km],U[km],TI[km],oi[km]
# plain building faces (the rip lost their textures; plus the walls and caps close.py added): real Rockport facade and roof
# textures, planar mapped at the scale the city uses them, so their windows match the textured buildings around them
vert=ny<.3
def scale(sel,horiz):
    T=P[sel];UU=U[sel];out=[]
    for a_,b_ in((0,1),(1,2),(2,0)):
        dw=T[:,b_]-T[:,a_];du=np.abs(UU[:,b_]-UU[:,a_])
        if horiz:
            hh=np.hypot(dw[:,0],dw[:,2]);m=(np.abs(dw[:,1])<.05*hh+.01)&(du[:,0]>.05)&(hh>.5);out.append(hh[m]/du[m,0])
            vv=np.abs(dw[:,1]);m=(hh<.05*vv+.01)&(du[:,1]>.05)&(vv>.5);out.append(-vv[m]/du[m,1])
        else:
            hh=np.hypot(dw[:,0],dw[:,2]);m=(du.max(1)>.05)&(hh>.5);out.append(hh[m]/np.hypot(du[m,0],du[m,1]))
    o=np.concatenate(out) if out else np.zeros(0)
    if horiz:
        mu=np.median(o[o>0]) if (o>0).sum()>5 else 0;mv=np.median(-o[o<0]) if (o<0).sum()>5 else 0;return mu,mv
    return (np.median(o) if len(o)>5 else 0),0
def cands(sel,horiz,n):
    t=TI[sel];ar=nl[sel]*.5;tot=np.bincount(t,weights=ar,minlength=len(TNAME));out=[]
    for tid in np.argsort(-tot)[:n*3]:
        if tot[tid]<=0:break
        mu,mv=scale(sel&(TI==tid),horiz)
        if horiz and not(2<mu<40 and 2<mv<40):continue
        if not horiz and not(.5<mu<40):continue
        out.append((tid,mu,mv,tot[tid]))
        if len(out)>=n:break
    return out
FAC=cands((K==1)&vert&(TI>=0),True,24);ROO=cands((K==1)&(ny>.7)&(TI>=0),False,8)
print('facade textures',len(FAC),'roof textures',len(ROO))
need=(K==1)&(TI<0)
if FAC and need.any():
    w_=np.array([f[3] for f in FAC]);w_=np.cumsum(w_/w_.sum());pk=np.searchsorted(w_,H(uo,11)*.999)
    yb=ymn[oi]
    fw=need&vert;idx=np.flatnonzero(fw);f_=pk[oi[idx]]
    T=P[idx];nn=np.cross(T[:,1]-T[:,0],T[:,2]-T[:,0]);ax=-nn[:,2];az=nn[:,0];l_=np.hypot(ax,az)+1e-9;ax/=l_;az/=l_
    mu=np.array([FAC[i][1] for i in f_]);mv=np.array([FAC[i][2] for i in f_])
    uu=(T[:,:,0]*ax[:,None]+T[:,:,2]*az[:,None])/mu[:,None];vv=1-(T[:,:,1]-yb[idx][:,None])/mv[:,None]
    uu-=np.floor(uu.min(1))[:,None];vv-=np.floor(vv.min(1))[:,None]
    U[idx,:,0]=uu;U[idx,:,1]=vv;TI[idx]=np.array([FAC[i][0] for i in f_])
    print('plain walls given facade textures',len(idx))
if ROO and need.any():
    low=need&~vert&(TI<0)&(cen[:,1]<ymx[oi]-1.5)
    ct=TI[((K==2)|(K==3))&(TI>=0)];
    if len(ct) and low.any():
        cnt_=np.bincount(ct);tc_=np.array([ATL['r'][n][4] for n in TNAME]);sat_=(tc_.max(1)-tc_.min(1))/np.maximum(tc_.max(1),1e-3);lm_=tc_.mean(1)
        cnt_=np.where((TEXV[:len(cnt_)]<.1)&(sat_[:len(cnt_)]<.15)&(lm_[:len(cnt_)]>.25)&(lm_[:len(cnt_)]<.75),cnt_,0);cid=cnt_.argmax()  # plain concrete, never a sign or chevron texture
        cm,_=scale(((K==2)|(K==3))&(TI==cid),False);cm=cm if cm>.5 else 4.
        idx=np.flatnonzero(low);T=P[idx];uu=T[:,:,0]/cm;vv=T[:,:,2]/cm;uu-=np.floor(uu.min(1))[:,None];vv-=np.floor(vv.min(1))[:,None]
        U[idx,:,0]=uu;U[idx,:,1]=vv;TI[idx]=cid;print('ceilings given concrete',len(idx))
    rr=need&~vert&(TI<0);idx=np.flatnonzero(rr);rk=(H(uo,13)*len(ROO)).astype(int)%len(ROO);f_=rk[oi[idx]]
    mr=np.array([ROO[i][1] for i in f_]);T=P[idx];uu=T[:,:,0]/mr[:,None];vv=T[:,:,2]/mr[:,None]
    uu-=np.floor(uu.min(1))[:,None];vv-=np.floor(vv.min(1))[:,None]
    U[idx,:,0]=uu;U[idx,:,1]=vv;TI[idx]=np.array([ROO[i][0] for i in f_]);print('plain roofs given roof textures',len(idx))
# textured faces far out of the int16 uv range: shift by whole tiles
big=np.abs(U).max((1,2))>30;U[big]-=np.floor(U[big].min(1,keepdims=True))
# generated buildings: their own clean colours (walls / roof)
if LAMPC:
    _l7=np.flatnonzero(K==7);C[_l7]=np.where((O[_l7]==9100001)[:,None],np.array([.95,.93,.86],np.float32),np.array([.23,.25,.28],np.float32))
if GCOL:
    g6=np.flatnonzero(K==6);C[g6]=np.array([GCOL[o-o%4][o%4] for o in O[g6]])
# palette: k-means 192 on a sample
from scipy.cluster.vq import kmeans2
rng=np.random.default_rng(1); _ns=np.flatnonzero(K<6); smp=C[_ns[rng.choice(len(_ns),200000,replace=False)]]
pal,_=kmeans2(smp.astype(np.float64),192,minit='++',seed=3,iter=12)
pal=np.clip(pal,0,1)
if GCOL:
    _gc=[np.unique(np.array([v[r] for v in GCOL.values()]),axis=0) for r in range(4)];_all=np.concatenate(_gc+[np.array([[.95,.93,.86],[.23,.25,.28]],np.float32)]);pal[-len(_all):]=_all
    _o=len(pal)-len(_all);GROLE={}
    for r,g_ in enumerate(_gc):
        for i in range(len(g_)):GROLE[_o]=r;_o+=1
tree=cKDTree(pal); _,ci=tree.query(C); ci=ci.astype(np.uint8)
if GCOL:  # generated faces index their own role colours exactly (never a look-alike k-means entry, which would lose the windows)
    _base=len(pal)-len(_all);_offs=np.cumsum([0]+[len(g_) for g_ in _gc])
    for r in range(4):
        sel=np.flatnonzero((K==6)&(O%4==r))
        if len(sel):_,j=cKDTree(_gc[r]).query(C[sel]);ci[sel]=(_base+_offs[r]+j).astype(np.uint8)
if LAMPC:
    _l7=np.flatnonzero(K==7);ci[_l7]=np.where(O[_l7]==9100001,len(pal)-2,len(pal)-1).astype(np.uint8)
# tiles: per tile and category, one mesh per texture (kept as is: decimating would tear the uv layout) + one plain mesh (decimated)
ti=(cen[:,0]//TILE).astype(int); tj=(cen[:,2]//TILE).astype(int); NT=WXZ//TILE
gid=np.where(TI>=0,TI,65535).astype(np.int64)
key=((tj*NT+ti)*8+K.astype(np.int64))*65536+gid
order=np.argsort(key,kind='stable'); ks=key[order]
bounds=np.flatnonzero(np.diff(ks))+1; starts=np.r_[0,bounds]; ends=np.r_[bounds,len(ks)]
meshes=[]; tot=0; t0=time.time()
for s,e in zip(starts,ends):
    idx=order[s:e]; k=int(ks[s]); g=k%65536; k//=65536; cat=k%8; tile=k//8; tx,tz=(tile%NT)*TILE,(tile//NT)*TILE
    tri=P[idx]
    if g!=65535:
        q=np.concatenate([np.round(tri.reshape(-1,3)*50),np.round(U[idx].reshape(-1,2)*1024)],1).astype(np.int64)
        uq,inv=np.unique(q,axis=0,return_inverse=True); inv=inv.ravel(); V=uq[:,:3]/50.; UV=uq[:,3:5]/1024.; F=inv.reshape(-1,3)
        good=(F[:,0]!=F[:,1])&(F[:,1]!=F[:,2])&(F[:,0]!=F[:,2]);F=F[good];fcol=ci[idx][good]
        if len(F)==0:continue
        meshes.append((tile,cat,tx,tz,V.astype(np.float32),F.astype(np.uint32),fcol,int(g),UV.astype(np.float32)));tot+=len(F);continue
    q=np.round(tri.reshape(-1,3)*50).astype(np.int64)
    uq,inv=np.unique(q,axis=0,return_inverse=True); V=uq/50.; F=inv.reshape(-1,3)
    F=F[(F[:,0]!=F[:,1])&(F[:,1]!=F[:,2])&(F[:,0]!=F[:,2])]
    src_c=tri.mean(1); src_ci=ci[idx]
    n=len(F)
    if n>80 and False:
        sm=pyfqmr.Simplify(); sm.setMesh(V,F); sm.simplify_mesh(target_count=max(40,int(n*RAT[cat])),aggressiveness=AGG[cat],preserve_border=True,verbose=False)
        V,F,_=sm.getMesh()
    if len(F)==0: continue
    fc=V[F].mean(1); _,nn=cKDTree(src_c).query(fc); fcol=src_ci[nn]
    meshes.append((tile,cat,tx,tz,V.astype(np.float32),F.astype(np.uint32),fcol,-1,None)); tot+=len(F)
print('meshes',len(meshes),'tris',tot,'textured',sum(len(m[5]) for m in meshes if m[7]>=0),'secs',round(time.time()-t0))
# pack: header json + binary. positions int16 (x,z rel tile in 1/64 m; y in 1/32 m), [uv int16 in 1/1024], indices uint16, colour per face uint8
blob=bytearray(); meta=[]
for tile,cat,tx,tz,V,F,fc,tid,UV in meshes:
    if len(V)>65535: raise SystemExit('too many verts')
    qv=np.empty((len(V),3),np.int16); qv[:,0]=np.clip(np.round((V[:,0]-tx)*64),-32768,32767); qv[:,1]=np.clip(np.round(V[:,1]*32),-32768,32767); qv[:,2]=np.clip(np.round((V[:,2]-tz)*64),-32768,32767)
    o=len(blob); blob+=qv.tobytes()
    if tid>=0: blob+=np.clip(np.round(UV*1024),-32768,32767).astype(np.int16).tobytes()
    blob+=F.astype(np.uint16).tobytes();
    if len(blob)%2: blob+=b'\0'
    blob+=fc.astype(np.uint8).tobytes()
    while len(blob)%4: blob+=b'\0'
    meta.append([int(tile),int(cat),int(tx),int(tz),len(V),len(F),o,int(tid)])
Hq=np.clip(np.round(Hf*8),-32768,32767).astype(np.int16); ground_off=len(blob); blob+=Hq.tobytes()
urb_off=len(blob); blob+=np.round(URB*255).astype(np.uint8).tobytes()
# land mask (cells with real ground or road under them): the sea is drawn only off it, so sunken roads are not flooded
known_off=len(blob); blob+=ndimage.binary_dilation(known,iterations=1).astype(np.uint8).tobytes()
while len(blob)%4: blob+=b'\0'
json.dump({'fac':[[int(f[0]),round(float(f[1]),2),round(float(f[2]),2)] for f in FAC],'roo':[[int(f[0]),round(float(f[1]),2)] for f in ROO],'tex':[[round(float(v),6) for v in ATL['r'][n][:4]] for n in TNAME],'texc':[ATL['r'][n][4] for n in TNAME],'grole':{str(k):v for k,v in (GROLE.items() if GCOL else [])},'texv':[round(float(v),3) for v in TEXV],'gc':GC,'gn':int(GN),'goff':ground_off,'uoff':urb_off,'koff':known_off,'genb':([float(v) for v in os.environ['GENB'].split(',')] if os.environ.get('GENB') else None),'gscale':8,'tile':TILE,'w':WXZ,'shift':[SX,SZ],'pal':[[round(float(c),4) for c in p] for p in pal],'m':meta},open(OUT+'.json','w'),separators=(',',':'))
open(OUT+'.bin','wb').write(blob)
# preview soup
pos=[];col=[]
for tile,cat,tx,tz,V,F,fc,tid,UV in meshes: pos.append(V[F].reshape(-1,3)); col.append(np.repeat((pal[fc]*255).astype(np.uint8),3,0))
np.concatenate(pos).astype(np.float32).tofile(OUT+'_prev.pos'); np.concatenate(col).tofile(OUT+'_prev.col')
print('bin MB',len(blob)/1e6)
