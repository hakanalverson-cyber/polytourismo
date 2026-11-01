# join roads that stop short: every dead end of the traced network whose road surface really ends (not a gap in the trace)
# looks ahead for another road at about the same height with nothing (building, hill) in between and gets a new
# asphalt ribbon to it. Also writes the "no tree here" mask (roads, new ribbons, building footprints) for pack.py.
import sys,json,math,numpy as np
from scipy import ndimage
from scipy.spatial import cKDTree
EX,PK=sys.argv[1],sys.argv[2]
SX,SZ=2200.,6900.;W=10240;RC=2;RN=W//RC
M=np.unpackbits(np.load(PK+'_roadmask.npy'))[:RN*RN].reshape(RN,RN).astype(bool)
roads=json.load(open(PK+'_roads.json'))
# rasters from the extracted faces: road top height, ground top height, building footprints
Yr=np.full((RN,RN),-1e9,np.float32);G=np.full((RN,RN),-1e9,np.float32);B=np.zeros((RN,RN),bool)
rng=np.random.default_rng(4)
def samp(T,dens):
    nrm=np.cross(T[:,1]-T[:,0],T[:,2]-T[:,0]);ar=np.linalg.norm(nrm,axis=1)*.5
    ns=np.clip((ar/dens).astype(int),1,3000);rep=np.repeat(np.arange(len(T)),ns)
    a=rng.random(len(rep));b=rng.random(len(rep));f=a+b>1;a[f]=1-a[f];b[f]=1-b[f]
    p=T[rep,0]+(T[rep,1]-T[rep,0])*a[:,None]+(T[rep,2]-T[rep,0])*b[:,None]
    return np.concatenate([p,T.reshape(-1,3)])
def cells(p):return np.clip((p[:,2]/RC).astype(int),0,RN-1),np.clip((p[:,0]/RC).astype(int),0,RN-1)
for i in range(1,14):
    z=np.load(f'{EX}/p{i}.npz');P=z['P'].astype(np.float64);P[:,:,0]+=SX;P[:,:,2]+=SZ;K=z['K']
    nrm=np.cross(P[:,1]-P[:,0],P[:,2]-P[:,0]);ny=np.abs(nrm[:,1])/(np.linalg.norm(nrm,axis=1)+1e-9)
    c=z['C'].astype(float)/255;v=c.max(1);s_=(c.max(1)-c.min(1))/np.maximum(v,1e-3)
    road=(z['R']|((K==0)&z['X']&(s_<.18)&(v>.15)&(v<.55)))&(ny>.8)
    if road.any():
        p=samp(P[road],1.);j,k=cells(p);np.maximum.at(Yr,(j,k),p[:,1].astype(np.float32))
    gr=(K==0)&(ny>.5)
    if gr.any():
        p=samp(P[gr],2.);j,k=cells(p);np.maximum.at(G,(j,k),p[:,1].astype(np.float32))
    bl=K==1
    if bl.any():
        p=samp(P[bl],1.5);j,k=cells(p);B[j,k]=True
B=ndimage.binary_fill_holes(ndimage.binary_closing(B,iterations=2))
B=ndimage.binary_erosion(B,iterations=1)
print('rasters done; building cells',int(B.sum()))
# graph points
pts=[];rid=[];sid=[]
for i,r in enumerate(roads):
    for k,(x,z) in enumerate(zip(r['x'],r['z'])):pts.append((x,z));rid.append(i);sid.append(k)
pts=np.array(pts);rid=np.array(rid);sid=np.array(sid);kd=cKDTree(pts)
ys=np.concatenate([r['y'] for r in roads])
def m_at(x,z):
    i=int(x/RC);j=int(z/RC)
    return 0<=i<RN and 0<=j<RN and M[j,i]
def cell(x,z):return min(max(int(z/RC),0),RN-1),min(max(int(x/RC),0),RN-1)
ends=[]
for i,r in enumerate(roads):
    n=len(r['x'])
    for e in (0,-1):
        p=np.array([r['x'][e],r['z'][e]]);nb=kd.query_ball_point(p,14)
        if any(rid[j]!=i for j in nb):continue
        # outward direction from the last ~24 m
        k2=min(4,n-1);q=np.array([r['x'][k2 if e==0 else n-1-k2],r['z'][k2 if e==0 else n-1-k2]]);d=p-q;l=np.linalg.norm(d)
        if l<1:continue
        ends.append((i,e,p,d/l,r['y'][e],r['hw']))
print('dead ends',len(ends))
def path_ok(P0,P1,y0,y1,curve):
    n=len(curve);bad=0
    for t,(x,z) in enumerate(curve):
        j,k=cell(x,z);f=t/(n-1);y=y0+(y1-y0)*f
        if 3<t<n-4 and B[j,k]:return False
        if G[j,k]>y+2.5 or (Yr[j,k]>y+2.5 and not M[j,k]):bad+=1
    return bad<=2
def herm(p,tp,q,tq,step=3.):
    L=np.linalg.norm(q-p);n=max(3,int(L/step)+1);t=np.linspace(0,1,n)[:,None]
    h00=2*t**3-3*t**2+1;h10=t**3-2*t**2+t;h01=-2*t**3+3*t**2;h11=t**3-t**2
    return h00*p+h10*tp*L+h01*q+h11*tq*L
REAL=[];real=0;joined=[];newroads=[];tris=[]
used=set()
for (i,e,p,d,y,hw) in ends:
    # does the road surface carry on ahead (gap in the trace only)?
    cont=False
    for s in np.arange(max(2,hw*.6),hw+26,2):
        for lat in (-hw*.5,0,hw*.5):
            x=p[0]+d[0]*s-d[1]*lat;z=p[1]+d[1]*s+d[0]*lat;j,k=cell(x,z)
            if m_at(x,z) and abs(Yr[j,k]-y)<3:cont=True;break
        if cont:break
    if cont:continue
    real+=1;REAL.append([float(p[0]),float(p[1]),float(d[0]),float(d[1]),0])
    # candidates ahead
    nb=kd.query_ball_point(p,170);best=None
    for j in nb:
        if rid[j]==i:continue
        q=pts[j];v=q-p;D=np.linalg.norm(v)
        if D<6:continue
        ang=math.acos(max(-1,min(1,float(v@d)/D)))
        if ang>math.radians(50):continue
        if abs(ys[j]-y)>1.5+.09*D:continue
        sc=D*(1+1.6*ang)
        if best is None or sc<best[0]:best=(sc,j,D,ang)
    if best is None:continue
    _,j,D,ang=best;q=pts[j];r2=roads[rid[j]];k=sid[j];n2=len(r2['x'])
    # tangent at the target: along the target road if we meet its end, else straight in
    if k in (0,n2-1):
        kk=min(4,n2-1);qq=np.array([r2['x'][kk if k==0 else n2-1-kk],r2['z'][kk if k==0 else n2-1-kk]]);tq=q-qq;tq=-tq/max(np.linalg.norm(tq),1e-6);tq=-tq
        # meeting end-to-end: arrive heading into the target road
        tq=(qq-q)/max(np.linalg.norm(qq-q),1e-6)
    else:
        tq=(q-p)/D
    cur=herm(p-d*3,d,q+tq*2,tq)
    key=(min(i,rid[j]),max(i,rid[j]))
    if key in used:continue
    if not path_ok(p,q,y,ys[j],cur):continue
    used.add(key)
    w=float(np.clip(min(hw,r2['hw']),3,8));y1=float(ys[j]);n=len(cur)
    tt=np.linspace(0,1,n);yy=y+(y1-y)*(tt*tt*(3-2*tt))+.04
    tg=np.gradient(cur,axis=0);tg/=np.linalg.norm(tg,axis=1,keepdims=True)+1e-9;nm=np.stack([-tg[:,1],tg[:,0]],1)
    L=cur+nm*w;R=cur-nm*w
    for a in range(n-1):
        la=[L[a,0],yy[a],L[a,1]];ra=[R[a,0],yy[a],R[a,1]];lb=[L[a+1,0],yy[a+1],L[a+1,1]];rb=[R[a+1,0],yy[a+1],R[a+1,1]]
        tris+= [[la,ra,rb],[la,rb,lb]]
        # skirts down to the ground on both sides
        for s0,s1 in ((la,lb),(ra,rb)):
            d0=[s0[0],s0[1]-1.4,s0[2]];d1=[s1[0],s1[1]-1.4,s1[2]];tris+=[[s0,s1,d1],[s0,d1,d0]]
    newroads.append({'x':[round(float(v),1) for v in cur[:,0]],'z':[round(float(v),1) for v in cur[:,1]],'y':[round(float(v),2) for v in yy],'hw':round(w,1),'L':float(np.hypot(*np.diff(cur,axis=0).T).sum()),'join':1})
    joined.append(D);REAL[-1][4]=1
    # paint it into the road mask (trees, map)
    for (x,z) in cur:
        j0,k0=cell(x,z);r_=int(w/RC)+1;M[max(0,j0-r_):j0+r_+1,max(0,k0-r_):k0+r_+1]=True
json.dump(REAL,open(PK+'_ends.json','w'));print('real ends',real,'joined',len(joined),'km',round(sum(joined)/1000,2))
roads+=newroads
json.dump(roads,open(PK+'_roads.json','w'),separators=(',',':'))
np.savez(EX+'/extra.npz',P=np.array(tris,np.float32).reshape(-1,3,3))
# trees: nowhere on a road (4 m margin) or inside a building
NT=ndimage.binary_dilation(M,iterations=1)|B
np.save(PK+'_notree.npy',np.packbits(NT))
print('extra road tris',len(tris))
np.save(PK+'_bld.npy',np.packbits(B))
