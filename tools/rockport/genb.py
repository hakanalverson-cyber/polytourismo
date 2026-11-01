# our own buildings: every Rockport building (K1 object) inside the region becomes a clean prism on its real outline and height,
# walls in a game palette with the window texture, flat roof. Returns new faces (K=6) and the original K1 faces to drop.
# Outlines are placed biggest first on a shared 1 m raster, so buildings never grow into each other.
import numpy as np
from scipy import ndimage
from skimage import measure
import mapbox_earcut as EC
WALLC=[0xf1eee6,0xe7dcc6,0xd8c9ac,0xcbd5de,0xb9c6b0,0xa5bccd,0xe9d8b0,0xc8c3bb,0x8fa7b8,0xb3958a,0xd3d7cf,0xbfb4a3]
ROOFC=[0x55585e,0x6a6862,0x4a4e55,0x7a756c]
SHOPC=[0x3d434b,0x4f4a45,0x2f4d63,0x5a3b38,0x44544a]
FH=3.4;SH=4.8   # storey height of the window texture and of the shop band (matches frrock)
hx=lambda h:np.array([(h>>16&255)/255,(h>>8&255)/255,(h&255)/255],np.float32)
def gen(P,O,K,cx,cz,R,base_id=8000000):
    cen=P.mean(1);inr=(K==1)&(np.hypot(cen[:,0]-cx,cen[:,2]-cz)<R)
    idx=np.flatnonzero(inr);order=idx[np.argsort(O[idx],kind='stable')];oo=O[order];cut=np.flatnonzero(np.diff(oo))+1
    rng=np.random.default_rng(3)
    G=int(2*R)+200;ox,oz=cx-R-100,cz-R-100
    cand=[]
    for g in np.split(order,cut):
        if len(g)==0:continue
        T=P[g];V=T.reshape(-1,3)
        a=rng.random((len(T),24,1));b=rng.random((len(T),24,1));f=(a+b)>1;a[f]=1-a[f];b[f]=1-b[f]
        S=(T[:,None,0]+(T[:,None,1]-T[:,None,0])*a+(T[:,None,2]-T[:,None,0])*b).reshape(-1,3);S=np.concatenate([S,V])
        gi=(S[:,0]-ox).astype(int);gj=(S[:,2]-oz).astype(int)
        ok=(gi>=2)&(gj>=2)&(gi<G-2)&(gj<G-2);S,gi,gj=S[ok],gi[ok],gj[ok]
        if len(S)<10:continue
        i0,j0=gi.min()-3,gj.min()-3;li=gi-i0;lj=gj-j0
        if li.max()>700 or lj.max()>700:continue
        M=np.zeros((lj.max()+4,li.max()+4),bool);M[lj,li]=True
        M=ndimage.binary_fill_holes(ndimage.binary_closing(ndimage.binary_dilation(M,iterations=1),iterations=3))
        L,n=ndimage.label(M)
        for lab in range(1,n+1):
            m=L==lab
            if m.sum()<25:continue
            Sy=S[L[lj,li]==lab,1]
            if len(Sy)<10:continue
            y0=np.percentile(Sy,2)-.6;y1=np.percentile(Sy,98)
            if y1-y0<3.2:continue
            cand.append((int(m.sum()),i0,j0,m,y0,y1))
    cand.sort(key=lambda c:-c[0])
    OCC=np.zeros((G,G),bool);newP=[];newO=[];cols={};nb=0;drop=0
    for area,i0,j0,m,y0,y1 in cand:
        h_,w_=m.shape;occ=ndimage.binary_dilation(OCC[j0:j0+h_,i0:i0+w_],iterations=1)
        m2=ndimage.binary_opening(m&~occ,iterations=2)
        L,n=ndimage.label(m2)
        if n==0:drop+=1;continue
        sz=ndimage.sum(m2,L,range(1,n+1));m2=L==(1+int(np.argmax(sz)))
        if m2.sum()<.55*area or m2.sum()<25:drop+=1;continue   # mostly inside a bigger building: it is part of that one
        if ndimage.distance_transform_edt(np.pad(m2,1)).max()<3.:drop+=1;continue   # a thin frame or wall, not a building
        OCC[j0:j0+h_,i0:i0+w_]|=m2
        cs=measure.find_contours(np.pad(m2,1).astype(float),.5)
        if not cs:continue
        c=max(cs,key=len);c=measure.approximate_polygon(c,tolerance=1.0)
        if len(c)<4:continue
        poly=np.stack([c[:,1]-1+i0+ox,c[:,0]-1+j0+oz],1)[:-1]
        nb+=1;bid=base_id+nb*4;h=(bid*2654435761)%1000003/1000003.
        wc=hx(WALLC[int(h*len(WALLC))%len(WALLC)])
        cols[bid]=(wc,hx(ROOFC[int(h*97)%len(ROOFC)]),hx(SHOPC[int(h*31)%len(SHOPC)]),np.clip(wc*.84,0,1).astype(np.float32))
        # storeys: shop band at street level on bigger buildings, whole window floors, a parapet trim of the wall colour on top
        # (the face role rides in the object id: +0 wall, +1 roof, +2 shop band, +3 trim)
        ht=y1-y0;yb=y0+SH if ht>9 else y0
        nf=max(1,int(round((y1-yb-(.7 if ht>6 else 0))/FH)));yt=yb+nf*FH
        y1=yt+.7 if ht>6 else yt
        bands=[(y0,yb,2),(yb,yt,0),(yt,y1,3)]
        for k in range(len(poly)):
            p,q=poly[k],poly[(k+1)%len(poly)]
            for a_,b_,role in bands:
                if b_-a_<.05:continue
                A=[p[0],a_,p[1]];B=[q[0],a_,q[1]];C=[q[0],b_,q[1]];D=[p[0],b_,p[1]]
                newP+=[[A,B,C],[A,C,D]];newO+=[bid+role,bid+role]
        try:t=EC.triangulate_float64(poly.astype(np.float64),np.array([len(poly)],np.uint32)).reshape(-1,3)
        except Exception:t=np.zeros((0,3),int)
        yr=y1-.35 if ht>6 else y1
        for tr in t:newP.append([[poly[i][0],yr,poly[i][1]] for i in tr]);newO.append(bid+1)
    import os
    if os.environ.get('GENDBG'):
        from PIL import Image
        im=np.zeros((G,G,3),np.uint8)
        for area,i0,j0,m,y0,y1 in cand:
            h_,w_=m.shape;im[j0:j0+h_,i0:i0+w_][m]+=np.array([0,0,60],np.uint8)
        im[OCC]=[0,200,0];Image.fromarray(im).save(os.environ['GENDBG']);print('cand areas top',[c[0] for c in cand[:8]])
    print('generated buildings',nb,'dropped as overlapping',drop,'faces',len(newP),'original building faces replaced',len(idx))
    return np.array(newP,np.float64).reshape(-1,3,3),np.array(newO,np.int64),inr,cols
