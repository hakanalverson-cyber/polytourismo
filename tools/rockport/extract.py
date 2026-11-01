# extract one part: kept triangles with a flat colour per face, tree positions, dropped categories
import sys,re,numpy as np,mapbox_earcut as EC
def roofs(tri):
    # cap the open top loops of a building shell: boundary edges chained into loops, flat ones above the base get a polygon
    v=np.round(tri.reshape(-1,3)*20).astype(np.int64);u,inv=np.unique(v,axis=0,return_inverse=True);V=u/20.;F=inv.reshape(-1,3)
    e=np.concatenate([F[:,[0,1]],F[:,[1,2]],F[:,[2,0]]]);es=np.sort(e,1);key=es[:,0]*(len(V)+1)+es[:,1]
    uk,cnt=np.unique(key,return_counts=True);b=e[np.isin(key,uk[cnt==1])]
    if len(b)<3 or len(b)>4000:return []
    nxt={}
    for a,c in b:nxt.setdefault(int(a),[]).append(int(c))
    ymin=V[:,1].min();out=[];seen=set()
    for st in list(nxt):
        if st in seen:continue
        loop=[st];cur=st;ok=False
        for _ in range(4000):
            n=[q for q in nxt.get(cur,[]) if q not in seen or q==st]
            if not n:break
            cur=n[0];seen.add(cur)
            if cur==st:ok=True;break
            loop.append(cur)
        seen.add(st)
        if not ok or len(loop)<3:continue
        L=V[loop];ys=L[:,1]
        if ys.max()-ys.min()>.8 or ys.min()<ymin+2.5:continue
        xy=L[:,[0,2]];area=.5*abs(np.sum(xy[:,0]*np.roll(xy[:,1],-1)-np.roll(xy[:,0],-1)*xy[:,1]))
        if area<3:continue
        try:t=EC.triangulate_float64(xy.astype(np.float64),np.array([len(loop)],dtype=np.uint32))
        except Exception:continue
        if len(t)<3:continue
        out.append(L[t.reshape(-1,3)])
    return out
sys.path.insert(0,sys.argv[1]); import glb
src,dst=sys.argv[2],sys.argv[3]
from PIL import Image
j,b=glb.load(src)
TEX={};TID={};TNAMES=[]
import hashlib,os
TD=os.path.dirname(dst)+'/tex';os.makedirs(TD,exist_ok=True)
def tex(mi):
    m=j['materials'][mi] if mi is not None else {}
    pb=m.get('pbrMetallicRoughness',{}); f=np.array(pb.get('baseColorFactor',[1,1,1,1]),np.float32)
    t=pb.get('baseColorTexture')
    alpha=m.get('alphaMode','OPAQUE')!='OPAQUE'
    if t is None: return None,f,alpha
    ii=j['textures'][t['index']]['source']
    if ii not in TEX:
        bv=j['bufferViews'][j['images'][ii]['bufferView']];o_=bv.get('byteOffset',0);raw=bytes(b[o_:o_+bv['byteLength']])
        h=hashlib.md5(raw).hexdigest()
        if not os.path.exists(TD+'/'+h):open(TD+'/'+h,'wb').write(raw)
        if h not in TNAMES:TNAMES.append(h)
        im=glb.image(j,b,ii).convert('RGBA').resize((64,64),Image.BOX)
        TEX[ii]=np.asarray(im,np.float32)/255.;TID[ii]=TNAMES.index(h)
    return TEX[ii],f,alpha
DROP=re.compile(r'^(.*DEINST|.*Reflection|.*refOnly|.*_99903|SKY|Panorama|XO_TrackBarrier|XS_|XO_(Hydrant|Garbage|Trash|Campus|ParkBench|Bike|Shopping|Carbody|Minivan|CrashBarrel|TirePile|Boxes|Barrel|Newspaper|Phone|Parking|Bollard|TrafficCone|Pilon|Patio|ItalFlag|BusSign|Mailbox|Bench|Chair|Table|Cone)|XV_)',re.I)
TREE=re.compile(r'^(XT_|XO_CT_Cypress|XO_CT_CampusSmackTree)',re.I)
CAT={'TRN':0,'XB':1,'XW':2,'XO':3,'PAN':4}
OID=0;NROOF=[0]
P=[];C=[];K=[];O=[];X=[];R=[];U=[];TI=[];AL=[];trees=[];drops={}
for mi,M,lab in glb.walk(j):
    base=re.sub(r'_[0-9].*$','',lab)
    if DROP.match(lab):
        drops[base]=drops.get(base,0)+1; continue
    if TREE.match(lab):
        tt=2 if re.search(r'Bush|Hedge|Grass|Shrub|Fern',lab,re.I) else 0 if re.search(r'Cedar|Spruce|Redwood|Evrgrn|Pine|Cypress|Poplar|Juniper|Fir|Treeline|Windbreak',lab,re.I) else 1
        trees.append([M[0,3],M[1,3],M[2,3],np.cbrt(abs(np.linalg.det(M[:3,:3]))),tt]); 
        # tree meshes: keep the trunk-ish world bbox for size
        for pr in j['meshes'][mi]['primitives']:
            p=glb.acc(j,b,pr['attributes']['POSITION']).astype(np.float64); w=(p@M[:3,:3].T)+M[:3,3]
            trees[-1]+= [w[:,0].min(),w[:,1].min(),w[:,2].min(),w[:,0].max(),w[:,1].max(),w[:,2].max()]; break
        continue
    cat=CAT.get(lab.split('_')[0],3); OID+=1; objtri=[]
    isroad=cat==0 and bool(re.search(r'Road|Highway|Hwy|Street|Junction',lab)) and 'Props' not in lab
    if cat==3:
        ext=0
        for pr in j['meshes'][mi]['primitives']:
            a=j['accessors'][pr['attributes']['POSITION']]; e=(np.array(a['max'])-np.array(a['min']))*np.cbrt(abs(np.linalg.det(M[:3,:3]))); ext=max(ext,e.max())
        if ext<4: drops['smallXO']=drops.get('smallXO',0)+1; continue
    for pr in j['meshes'][mi]['primitives']:
        if pr.get('mode',4)!=4 or 'indices' not in pr: continue
        p=glb.acc(j,b,pr['attributes']['POSITION']).astype(np.float64); w=((p@M[:3,:3].T)+M[:3,3]).astype(np.float32)
        ix=glb.acc(j,b,pr['indices']).reshape(-1,3).astype(np.int64)
        T,f,alpha=tex(pr.get('material'))
        fuv=np.zeros((len(ix),3,2),np.float32);ftid=np.full(len(ix),-1,np.int16)
        if T is not None and 'TEXCOORD_0' in pr['attributes']:
            uv=glb.acc(j,b,pr['attributes']['TEXCOORD_0']).astype(np.float32)
            fuv=uv[ix];ftid[:]=TID[j['textures'][j['materials'][pr['material']]['pbrMetallicRoughness']['baseColorTexture']['index']]['source']]
            cu=uv[ix].mean(1); x=(np.mod(cu[:,0],1)*63.999).astype(int); y=(np.mod(cu[:,1],1)*63.999).astype(int)
            col=T[y,x]*f
            # also the three corners, averaged with the centre: a less noisy face colour
            for k in range(3):
                u=uv[ix[:,k]]; col=col+T[(np.mod(u[:,1],1)*63.999).astype(int),(np.mod(u[:,0],1)*63.999).astype(int)]*f
            col/=4
        else:
            col=np.tile(f,(len(ix),1)); col[:,:3]=-1
        keep=np.ones(len(ix),bool)
        if cat==0:
            t3=w[ix].astype(np.float64);nn=np.cross(t3[:,1]-t3[:,0],t3[:,2]-t3[:,0]);ar=np.linalg.norm(nn,axis=1)/2;nyy=np.abs(nn[:,1])/(2*ar+1e-9)
            keep&=~((ar>900)&(nyy<.8))
        if alpha: keep&=col[:,3]>.12
        objtri.append(w[ix[keep]])
        U.append(fuv[keep]);TI.append(ftid[keep]);AL.append(np.full(keep.sum(),bool(alpha)));P.append(w[ix[keep]]); X.append(col[keep,0]>=0); C.append((np.clip(col[keep,:3],0,1)*255).astype(np.uint8)); O.append(np.full(keep.sum(),OID,np.int32)); R.append(np.full(keep.sum(),isroad,bool)); K.append(np.full(keep.sum(),cat,np.uint8))
    if cat==1 and objtri:
        for rt in roofs(np.concatenate(objtri)):
            n=len(rt);U.append(np.zeros((n,3,2),np.float32));TI.append(np.full(n,-1,np.int16));AL.append(np.zeros(n,bool));P.append(rt.astype(np.float32));X.append(np.zeros(n,bool));C.append(np.zeros((n,3),np.uint8));O.append(np.full(n,OID,np.int32));R.append(np.zeros(n,bool));K.append(np.full(n,cat,np.uint8));NROOF[0]+=n
P=np.concatenate(P) if P else np.zeros((0,3,3),np.float32)
np.savez(dst,U=np.concatenate(U) if U else np.zeros((0,3,2),np.float32),TI=np.concatenate(TI) if TI else np.zeros(0,np.int16),AL=np.concatenate(AL) if AL else np.zeros(0,bool),TN=np.array(TNAMES),P=P,C=np.concatenate(C),K=np.concatenate(K),O=np.concatenate(O),X=np.concatenate(X),R=np.concatenate(R),T=np.array([t[:4]+t[5:] if len(t)>5 else t for t in trees],np.float32) if trees else np.zeros((0,10),np.float32),Tn=np.array([t[4] for t in trees]))
print(src.split('/')[-1],'roof tris',NROOF[0],'tris',len(P),'trees',len(trees),'dropped',sum(drops.values()))
