# the free-roam garage building (Hakan's model): flat face colours in the map's style, decimated, written as a small binary
import sys,numpy as np,pyfqmr
from PIL import Image
sys.path.insert(0,__file__.rsplit('/',1)[0]);import glb
src,OUTF=sys.argv[1],sys.argv[2]
j,b=glb.load(src);TEX={}
def tex(mi):
    m=j['materials'][mi] if mi is not None else {};pb=m.get('pbrMetallicRoughness',{});f=np.array(pb.get('baseColorFactor',[1,1,1,1]),np.float32);t=pb.get('baseColorTexture')
    if t is None:return None,f
    ii=j['textures'][t['index']]['source']
    if ii not in TEX:TEX[ii]=np.asarray(glb.image(j,b,ii).convert('RGBA').resize((64,64),Image.BOX),np.float32)/255.
    return TEX[ii],f
P=[];C=[];G=[]
for gi,(mi,M,lab) in enumerate(glb.walk(j)):
    for pr in j['meshes'][mi]['primitives']:
        p=glb.acc(j,b,pr['attributes']['POSITION']).astype(np.float64);w=p@M[:3,:3].T+M[:3,3];ix=glb.acc(j,b,pr['indices']).reshape(-1,3).astype(np.int64)
        T,f=tex(pr.get('material'))
        if T is not None and 'TEXCOORD_0' in pr['attributes']:
            uv=glb.acc(j,b,pr['attributes']['TEXCOORD_0']).astype(np.float64);U=uv[ix];col=np.zeros((len(ix),4));n=0
            for a1 in np.linspace(.05,.9,5):
                for b1 in np.linspace(.05,.9,5):
                    if a1+b1>.95:continue
                    u=U[:,0]*(1-a1-b1)+U[:,1]*a1+U[:,2]*b1;col+=T[(np.mod(u[:,1],1)*63.999).astype(int),(np.mod(u[:,0],1)*63.999).astype(int)]*f;n+=1
            col/=n
        else:col=np.tile(f,(len(ix),1))
        keep=col[:,3]>.3
        P.append(w[ix[keep]]);C.append(col[keep,:3]);G.append(np.full(keep.sum(),pr.get('material') or 0))
P=np.concatenate(P);C=np.concatenate(C);G=np.concatenate(G)
# style: designed flat colours by part (the textures are grimy atlases): cladding, brick, steel, roof, glass, door
keepm=np.isin(G,[0,1,2,3,4,5]);P,C,G=P[keepm],np.clip(C[keepm],0,1),G[keepm]
hx=lambda h:np.array([(h>>16&255)/255,(h>>8&255)/255,(h&255)/255])
nrm=np.cross(P[:,1]-P[:,0],P[:,2]-P[:,0]);ny=nrm[:,1]/(np.linalg.norm(nrm,axis=1)+1e-9);cy=P[:,:,1].mean(1)
L=C.mean(1);mx=C.max(1);mn=C.min(1);sat=(mx-mn)/np.maximum(mx,1e-3)
blue=(C[:,2]>C[:,0]+.06)&(sat>.25);red=(C[:,0]>C[:,2]+.05)&(sat>.18)
out=np.zeros_like(C)
base={0:hx(0x8c8b86),1:hx(0x7d7f82),2:hx(0x3e454d),3:hx(0x2f4a66),4:hx(0x77909a),5:hx(0x8a8c8e)}
for g,c in base.items():out[G==g]=c
# walls: cladding teal-grey, a lighter band low down, brick where the texture is red
w=G==4;out[w&(cy<1.2)]=hx(0x9aa3a6);out[w&red]=hx(0x8e4a3a)
# brightness life from the texture (kept small so faces stay clean)
rel=np.clip((L-np.median(L))*.6,-.08,.08)[:,None];out=np.clip(out*(1+rel*2),0,1)
ar=np.linalg.norm(np.cross(P[:,1]-P[:,0],P[:,2]-P[:,0]),axis=1)/2;big=(G==2)&(ar>1.2)&(np.abs(ny)<.5)
ymax=P[:,:,1].max(1);out[big&(ymax>4)]=hx(0x8a5040);out[big&(ymax<=4)]=hx(0x9b978d)
out[blue&np.isin(G,[1,4,5])]=hx(0x2f5fa8)
out[(np.abs(ny)>.6)&(cy>4)&(G!=3)]=hx(0x4d5560)
out[(ny>.6)&(cy<.5)]=hx(0x8c8b86)
# coplanar faces of one big panel share the colour that covers most of its area (clean panels, no mottling)
nn_=np.cross(P[:,1]-P[:,0],P[:,2]-P[:,0]);aa_=np.linalg.norm(nn_,axis=1)/2;nu=nn_/(2*aa_[:,None]+1e-9)
sg=np.where(np.abs(nu[:,0])>.3,np.sign(nu[:,0]),np.where(np.abs(nu[:,1])>.3,np.sign(nu[:,1]),np.sign(nu[:,2])));nu*=sg[:,None]
dd=(nu*P[:,0]).sum(1);key=np.stack([np.round(nu[:,0]*12),np.round(nu[:,1]*12),np.round(nu[:,2]*12),np.round(dd*3)],1).astype(np.int64)
_,gid=np.unique(key,axis=0,return_inverse=True);gid=gid.ravel()
ci=np.round(out*255).astype(np.int64);ck=ci[:,0]*65536+ci[:,1]*256+ci[:,2]
from collections import defaultdict
acc=defaultdict(lambda:defaultdict(float));tot=defaultdict(float)
for g_,k_,a_ in zip(gid,ck,aa_):acc[g_][k_]+=a_;tot[g_]+=a_
for g_ in tot:
    if tot[g_]<6:continue
    k_=max(acc[g_].items(),key=lambda t:t[1])[0]
    if acc[g_][k_]<.45*tot[g_]:continue
    m_=gid==g_;out[m_]=np.array([k_>>16&255,k_>>8&255,k_&255])/255.
# Hakan: the garage looks like any other building in the city -> city building tones: one brick wall colour (the game
# lays the same window texture over it as on every building), tar roof, a plain steel roller door; a new logo sign is added in game
roofm=(np.abs(ny)>.6)&(cy>2.5);grd=(ny>.6)&(cy<.5);door=np.all(np.abs(out-hx(0x2f5fa8))<.02,1)
wallc=hx(0x8e4a3a);rel=np.clip((L-np.median(L))*.35,-.06,.06)[:,None]
out=np.clip(wallc*(1+rel),0,1)
glass=(G==3)&(np.abs(ny)<.5);trim=(G==2)&~big&(np.abs(ny)<.5)
out[trim]=hx(0x5a3a30);out[glass]=hx(0x3d4f63);out[roofm]=hx(0x4b4a47);out[grd]=hx(0x8c8b86)
C=out
# weld + decimate, colours back by nearest source face
q=np.round(P.reshape(-1,3)*200).astype(np.int64);uq,inv=np.unique(q,axis=0,return_inverse=True);V=uq/200.;F=inv.reshape(-1,3)
F=F[(F[:,0]!=F[:,1])&(F[:,1]!=F[:,2])&(F[:,0]!=F[:,2])]
from scipy.spatial import cKDTree
_,nn=cKDTree(P.mean(1)).query(V[F].mean(1));fc=(np.clip(C[nn],0,1)*255).astype(np.uint8)
print('garage tris',len(F),'bbox',V.min(0),V.max(0))
np.savez(OUTF,V=V.astype(np.float32),F=F.astype(np.uint16),C=fc)
