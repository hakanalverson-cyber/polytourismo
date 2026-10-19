#!/usr/bin/env python3
"""Splits the 190-car Sketchfab sheet into individual cars and writes assets/cars_v10.bin + cars_v10_tex.png + cars_v10.json
usage: python3 tools/build_pack.py path/to/Low_Poly_Cars_Mega_Pack.glb"""
import json,struct,sys,os,numpy as np
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import connected_components
from PIL import Image
F=sys.argv[1];OUT=os.path.dirname(os.path.abspath(__file__))+'/../assets/'
d=open(F,'rb').read();L=struct.unpack('<I',d[12:16])[0];j=json.loads(d[20:20+L]);B=d[20+L+8:]
bv=j['bufferViews'];acc=j['accessors']
def getacc(i):
    a=acc[i];v=bv[a['bufferView']];off=v.get('byteOffset',0)+a.get('byteOffset',0)
    n={'VEC3':3,'VEC2':2,'SCALAR':1}[a['type']];ct={5126:np.float32,5123:np.uint16,5125:np.uint32}[a['componentType']];sz=np.dtype(ct).itemsize;st=v.get('byteStride')
    if st and st!=n*sz:return np.lib.stride_tricks.as_strided(np.frombuffer(B,dtype=np.uint8,offset=off),shape=(a['count'],n*sz),strides=(st,1)).copy().view(ct).reshape(a['count'],n)
    return np.frombuffer(B,dtype=ct,count=a['count']*n,offset=off).reshape(a['count'],n).copy()
Pp=[];Nn=[];Uu=[];Ii=[];base=0
for m in j['meshes'][:11]:
    p=m['primitives'][0];pos=getacc(p['attributes']['POSITION']);Pp.append(pos);Nn.append(getacc(p['attributes']['NORMAL']));Uu.append(getacc(p['attributes']['TEXCOORD_0']));Ii.append(getacc(p['indices']).reshape(-1).astype(np.int64)+base);base+=len(pos)
P=np.concatenate(Pp);N=np.concatenate(Nn);U=np.concatenate(Uu);T=np.concatenate(Ii).reshape(-1,3)
# connected components by welded position
q=np.round(P/0.05).astype(np.int64);_,inv=np.unique(q,axis=0,return_inverse=True);inv=inv.reshape(-1);V=inv.max()+1
e=np.concatenate([T[:,[0,1]],T[:,[1,2]]]);g=coo_matrix((np.ones(len(e)),(inv[e[:,0]],inv[e[:,1]])),shape=(V,V));nc,lab=connected_components(g,directed=False);vl=lab[inv]
mn=np.full((nc,3),1e9);mx=np.full((nc,3),-1e9);np.minimum.at(mn,vl,P);np.maximum.at(mx,vl,P)
ii=[];jj=[]
for a in range(0,nc,500):
    b=slice(a,min(nc,a+500));ox=(mn[b,None,0]<=mx[None,:,0]+10)&(mx[b,None,0]>=mn[None,:,0]-10);oy=(mn[b,None,1]<=mx[None,:,1]+10)&(mx[b,None,1]>=mn[None,:,1]-10);r,c=np.nonzero(ox&oy);ii.append(r+a);jj.append(c)
ii=np.concatenate(ii);jj=np.concatenate(jj);g=coo_matrix((np.ones(len(ii)),(ii,jj)),shape=(nc,nc));ncar,cl=connected_components(g,directed=False);vcar=cl[vl]
print('cars',ncar)
tex=np.array(Image.open(OUT+'../tools/_tex.png').convert('RGB')) if os.path.exists(OUT+'../tools/_tex.png') else None
im=j['images'][0];v=bv[im['bufferView']];open(OUT+'cars_v10_tex_src.png','wb').write(B[v['byteOffset']:v['byteOffset']+v['byteLength']])
tex=np.array(Image.open(OUT+'cars_v10_tex_src.png').convert('RGB'))
def tcol(uv):
    x=np.clip((uv[:,0]*512).astype(int),0,511);y=np.clip((uv[:,1]*512).astype(int),0,511);return tex[y,x]
cars=[];blobs=[];cur=0
def put(arr):
    global cur
    arr=np.ascontiguousarray(arr);pad=(-cur)%4
    if pad:blobs.append(b'\0'*pad);cur+=pad
    o=cur;blobs.append(arr.tobytes());cur+=arr.nbytes;return o
def weld(p,n,u,t):
    rec=np.concatenate([p.astype(np.int16).view(np.uint8).reshape(len(p),6),n.astype(np.int8).view(np.uint8).reshape(len(p),3),u.astype(np.uint16).view(np.uint8).reshape(len(p),4)],1)
    rec=np.ascontiguousarray(rec).view(np.dtype((np.void,13))).reshape(-1)
    _,first,inv=np.unique(rec,return_index=True,return_inverse=True);return first,inv.reshape(-1)[t]
order=[]
for c in range(ncar):
    m=vcar==c;ctr=P[m][:,[0,1]].mean(0)
    vids=np.nonzero(m)[0];tm=m[T[:,0]];Tc=T[tm]
    # three coords: X=x, Y=-z, Z=y_raw
    p3=np.stack([P[:,0],-P[:,2],P[:,1]],1);n3=np.stack([N[:,0],-N[:,2],N[:,1]],1)
    pc=p3[vids];xz=pc[:,[0,2]];c0=xz.mean(0);X=xz-c0;_,_,vt=np.linalg.svd(X,full_matrices=False);ax=vt[0]
    rad=np.array([ctr[0],ctr[1]]);rad/=np.linalg.norm(rad);f=-np.sign(ax@rad)*ax*-1*-1  # front = inward along axis
    f=np.sign(-(ax@rad))*ax
    right=np.array([-f[1],f[0]])
    def xform(pp,nn):
        xz=pp[:,[0,2]]-c0;px=xz@right;pz=-(xz@f);return np.stack([px,pp[:,1],pz],1),np.stack([nn[:,0]*right[0]+nn[:,2]*right[1],nn[:,1],-(nn[:,0]*f[0]+nn[:,2]*f[1])],1)
    pp,nn=xform(p3,n3)
    lo=pp[vids].min(0);hi=pp[vids].max(0);cx=(lo[0]+hi[0])/2;cz=(lo[2]+hi[2])/2
    pp=pp-np.array([cx,lo[1],cz])
    size=(hi-lo)
    # dominant body colour by triangle area
    a=pp[Tc[:,0]];b=pp[Tc[:,1]];cc=pp[Tc[:,2]];area=np.linalg.norm(np.cross(b-a,cc-a),axis=1)/2
    col=tcol(U[Tc[:,0]]);key=col[:,0].astype(int)*65536+col[:,1].astype(int)*256+col[:,2]
    cy=(a[:,1]+b[:,1]+cc[:,1])/3;uvc=U[Tc[:,0]];glass=(uvc[:,0]<.26)&(uvc[:,1]<.26)
    cand=(cy>.3*size[1])&~glass
    if cand.sum()<20:cand=~glass
    uk,ik=np.unique(key[cand],return_inverse=True);ar=np.bincount(ik,weights=area[cand]);dom=uk[ar.argmax()];dcol=[int(dom>>16),int(dom>>8&255),int(dom&255)]
    ptri=key==dom
    # roof position along length (-1 front .. +1 rear) from the highest quarter of vertices
    hv=pp[vids];top=hv[hv[:,1]>hv[:,1].max()*.9];roof=float(top[:,2].mean()/(size[2]/2+1e-6))
    zr=hv[:,2]/(size[2]/2+1e-6);rear=hv[zr>.78];wingR=float(rear[:,1].max()/hv[:,1].max()) if len(rear) else 0
    parts=[]
    pq_all=np.clip(np.round(pp*10),-32000,32000)
    for name,sel in (('paint',ptri),('body',~ptri)):
        t=Tc[sel]
        if len(t)==0:parts.append({'n':name,'nv':0,'nt':0});continue
        allv=np.unique(t.reshape(-1));pqv=pq_all[allv].astype(np.int16)
        if name=='paint':rec=pqv.view(np.uint8).reshape(len(allv),6);w=6
        else:
            uqv=np.round(np.clip(U[allv],0,1)*65535).astype(np.uint16);rec=np.concatenate([pqv.view(np.uint8).reshape(len(allv),6),uqv.view(np.uint8).reshape(len(allv),4)],1);w=10
        rv=np.ascontiguousarray(rec).view(np.dtype((np.void,w))).reshape(-1);_,fi,iv=np.unique(rv,return_index=True,return_inverse=True);iv=iv.reshape(-1)
        remap=np.zeros(len(P),np.int64);remap[allv]=iv;ti=remap[t].astype(np.uint16);nv=len(fi);assert nv<65535
        o1=put(pqv[fi]);o3=put(uqv[fi]) if name=='body' else 0;o4=put(ti.reshape(-1))
        parts.append({'n':name,'nv':int(nv),'nt':int(len(t)),'p':o1,'u':o3,'i':o4})
    cars.append({'len':round(float(size[2])/100,3),'wid':round(float(size[0])/100,3),'hgt':round(float(size[1])/100,3),'roof':round(roof,3),'wing':round(wingR,3),'paint':dcol,'parts':parts,'cx':float(ctr[0]),'cy':float(ctr[1])})
# order cars by position on the sheet spiral (stable): sort by angle
cars_idx=sorted(range(len(cars)),key=lambda k:(round(np.arctan2(cars[k]['cy'],cars[k]['cx']),3)))
import gzip;raw=b''.join(blobs);open(OUT+'cars_v10.bin.gz','wb').write(gzip.compress(raw,9))
json.dump({'cars':cars},open(OUT+'cars_v10.json','w'))
Image.fromarray(tex).save(OUT+'cars_v10_tex.png',optimize=True)
print('bin',cur,'gz',os.path.getsize(OUT+'cars_v10.bin.gz'),'tex',os.path.getsize(OUT+'cars_v10_tex.png'))
