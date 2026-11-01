# final Rockport pack: meshes + ground (convert.py), roads (roads.py), trees, stops, map picture -> one gzipped blob
import sys,json,gzip,base64,struct,io,numpy as np,math
from scipy import ndimage
PK,EX,OUT=sys.argv[1],sys.argv[2],sys.argv[3]
SX,SZ=2200.,6900.
meta=json.load(open(PK+'.json'));blob=open(PK+'.bin','rb').read()
roads=json.load(open(PK+'_roads.json'))
GN=meta['gn'];GC=meta['gc'];H=np.frombuffer(blob,np.int16,GN*GN,meta['goff']).reshape(GN,GN)/8.
def Hf(x,z):
    i=min(max(int(round(x/GC)),0),GN-1);j=min(max(int(round(z/GC)),0),GN-1);return float(H[j,i])
# trees
T=[];TT=[]
for i in range(1,14):
    z=np.load(f'{EX}/p{i}.npz');t=z['T'];n=z['Tn']
    if len(t):T.append(t);TT.append(n)
T=np.concatenate(T);TT=np.concatenate(TT)
cx=(T[:,4]+T[:,7])/2+SX;cz=(T[:,6]+T[:,9])/2+SZ;by=T[:,5];th=T[:,8]-T[:,5]
ok=(th>1.2)&(th<60)&(cx>0)&(cz>0)&(cx<10240)&(cz<10240)
trees=np.stack([cx,by,cz,th,TT],1)[ok]
# thin trees standing within 1.5 m of each other (tree lines are stacks of cards)
q=np.round(trees[:,[0,2]]/3).astype(np.int64);_,u=np.unique(q[:,0]*100000+q[:,1],return_index=True);trees=trees[np.sort(u)]
# surfaces of the finished meshes (terrain + roads, 2 m): trees snap onto them, so none float or sink
RN=5120;SURF=np.full((RN,RN),-1e9,np.float32);TALLV=[];WALL=np.zeros((RN,RN),bool)
_rg=np.random.default_rng(3)
for tile,cat,tx,tz,nv,nf,off,tid_ in meta['m']:
    if cat not in (0,1,2,3,5):continue
    q16=np.frombuffer(blob,np.int16,nv*3,off).reshape(-1,3).astype(np.float64);V=np.stack([tx+q16[:,0]/64,q16[:,1]/32,tz+q16[:,2]/64],1)
    I=np.frombuffer(blob,np.uint16,nf*3,off+nv*(10 if tid_>=0 else 6)).reshape(-1,3).astype(np.int64);Tt=V[I]
    if cat==1:
        TALLV.append(V);continue
    if cat in (2,3):
        # walls, fences, rails: where they stand (the garage drive and lot must be free of them)
        nrm=np.cross(Tt[:,1]-Tt[:,0],Tt[:,2]-Tt[:,0]);nl=np.linalg.norm(nrm,axis=1)+1e-9;hl_=np.max([np.hypot(*(Tt[:,a_,[0,2]]-Tt[:,b_,[0,2]]).T) for a_,b_ in((0,1),(1,2),(2,0))],0);vt=(np.abs(nrm[:,1])/nl<.4)&(np.ptp(Tt[:,:,1],1)>1.)&(hl_>1.5)
        for a_,b_ in((0,1),(1,2),(2,0)):
            for t_ in(0,.25,.5,.75,1):
                q_=Tt[vt,a_]*(1-t_)+Tt[vt,b_]*t_;WALL[np.clip((q_[:,2]/2).astype(int),0,RN-1),np.clip((q_[:,0]/2).astype(int),0,RN-1)]=True
        continue
    nrm=np.cross(Tt[:,1]-Tt[:,0],Tt[:,2]-Tt[:,0]);nl=np.linalg.norm(nrm,axis=1)+1e-9;up=np.abs(nrm[:,1])/nl>.5;Tt=Tt[up];ar=nl[up]*.5
    if not len(Tt):continue
    ns=np.clip((ar/2).astype(int),1,2000);rp=np.repeat(np.arange(len(Tt)),ns);a_=_rg.random(len(rp));b_=_rg.random(len(rp));f_=a_+b_>1;a_[f_]=1-a_[f_];b_[f_]=1-b_[f_]
    pp=np.concatenate([Tt[rp,0]+(Tt[rp,1]-Tt[rp,0])*a_[:,None]+(Tt[rp,2]-Tt[rp,0])*b_[:,None],Tt.reshape(-1,3)])
    np.maximum.at(SURF,(np.clip((pp[:,2]/2).astype(int),0,RN-1),np.clip((pp[:,0]/2).astype(int),0,RN-1)),pp[:,1].astype(np.float32))
ti=np.clip((trees[:,0]/2).astype(int),0,RN-1);tj=np.clip((trees[:,2]/2).astype(int),0,RN-1)
# no trees on roads (4 m margin, joined roads too) or inside buildings
NTm=np.unpackbits(np.load(PK+'_notree.npy'))[:RN*RN].reshape(RN,RN).astype(bool)
keep=~NTm[tj,ti];print('trees removed from roads / buildings',int((~keep).sum()));trees=trees[keep];ti=ti[keep];tj=tj[keep]
sv=SURF[tj,ti];fv=np.array([Hf(x,z) for x,z in zip(trees[:,0],trees[:,2])])
sy=np.where((sv>-1e8)&(sv<=trees[:,1]+2.5),sv,np.where(sv>-1e8,trees[:,1],fv))
sy=np.where(sv<-1e8,np.maximum(fv,-50),sy)
print('trees moved >0.3 m',int((np.abs(sy-trees[:,1])>.3).sum()))
trees[:,1]=sy
# no trees in the sea
keep=trees[:,1]>-.5;trees=trees[keep]
# downtown: where the towers stand (building objects over 45 m tall and under 90 m across, from the extracted parts)
TW=[]
for i_ in range(1,14):
    z_=np.load(f'{EX}/p{i_}.npz');Kp=z_['K'];sel=Kp==1
    if not sel.any():continue
    Pp=z_['P'][sel];Op=z_['O'][sel];uo_,oi_=np.unique(Op,return_inverse=True)
    mn=np.full((len(uo_),3),1e9);mx=np.full((len(uo_),3),-1e9);np.minimum.at(mn,oi_,Pp.min(1));np.maximum.at(mx,oi_,Pp.max(1))
    ext=mx-mn;t=(ext[:,1]>45)&(ext[:,0]<90)&(ext[:,2]<90)
    for a_,b_ in zip(mn[t],mx[t]):TW.append(((a_[0]+b_[0])/2+SX,(a_[2]+b_[2])/2+SZ,b_[1]-a_[1]))
TW=np.array(TW);print('towers',len(TW))
hist,xe,ze=np.histogram2d(TW[:,0],TW[:,1],bins=20,range=[[0,10240],[0,10240]],weights=TW[:,2]);ix,iz=np.unravel_index(hist.argmax(),hist.shape)
cellm=(TW[:,0]>=xe[ix])&(TW[:,0]<xe[ix+1])&(TW[:,1]>=ze[iz])&(TW[:,1]<ze[iz+1])
dtx,dtz=float(np.average(TW[cellm,0],weights=TW[cellm,2])),float(np.average(TW[cellm,1],weights=TW[cellm,2]))
print('downtown anchor',round(dtx),round(dtz))
print('trees',len(trees))
# roads -> stops
R=[];
for k,r in enumerate(roads):
    x=np.array(r['x']);z=np.array(r['z']);cum=np.r_[0,np.cumsum(np.hypot(np.diff(x),np.diff(z)))]
    R.append(dict(id='r%d'%k,x=x,z=z,y=np.array(r['y']),hw=r['hw'],cum=cum,L=cum[-1]))
def frame(r,i):
    a=max(0,i-3);b=min(len(r['x'])-1,i+3);tx=r['x'][b]-r['x'][a];tz=r['z'][b]-r['z'][a];l=math.hypot(tx,tz) or 1;tx/=l;tz/=l
    return dict(x=float(r['x'][i]),z=float(r['z'][i]),tx=tx,tz=tz,nx=tz,nz=-tx,hw=r['hw'])
def at(r,s):
    i=int(np.searchsorted(r['cum'],s));return frame(r,min(i,len(r['x'])-1))
pois=[];used=[]
def poi(id,n,col,ic,key,x,z,ry,rad,**o):
    d=dict(id=id,n=n,col=col,ic=ic,key=key,x=round(x,1),z=round(z,1),ry=round(ry,3),r=rad);d.update(o);pois.append(d);used.append((x,z));return d
far=lambda x,z,d:all(math.hypot(x-a,z-b)>d for a,b in used)
# home strip: the longest wide road near the middle of the network
allx=np.concatenate([r['x'] for r in R]);allz=np.concatenate([r['z'] for r in R]);mx,mz=np.median(allx),np.median(allz)
# the garage: Hakan's building on a free lot by a wide road, as close to downtown as one is found; the shops follow along that road
GZ=np.load(PK.rsplit('/',1)[0]+'/garage.npz');GV=GZ['V'];GF=GZ['F'];GCOL=GZ['C']
BLD=np.unpackbits(np.load(PK+'_bld.npy'))[:RN*RN].reshape(RN,RN).astype(bool)
RM=np.unpackbits(np.load(PK+'_roadmask.npy'))[:RN*RN].reshape(RN,RN).astype(bool)
lx=np.linspace(-11.3,11.4,12);lz=np.linspace(-9.4,17.4,14);LX,LZ=np.meshgrid(lx,lz);LX=LX.ravel();LZ=LZ.ravel()
def clear(x,z,y,r=3,up=1.5,dn=1.6):
    # open sky and level ground around a road point: no deck or bridge above it, no drop beside it
    j=int(z/2);i=int(x/2);w=SURF[max(0,j-r):j+r+1,max(0,i-r):i+r+1];w=w[w>-1e8]
    return len(w)>0 and w.max()<=y+up and w.min()>=y-dn
def lot(r,i,side):
    f=frame(r,i);ry_=float(r['y'][i])
    if not clear(f['x'],f['z'],ry_,2,2.5,2.5):return None
    for t_ in np.linspace(f['hw']+1,f['hw']+8,4):
        xq,zq=f['x']+f['nx']*side*t_,f['z']+f['nz']*side*t_
        if not clear(xq,zq,ry_,1,1.8,1.8):return None

    dx,dz=-f['nx']*side,-f['nz']*side
    ox=f['x']+f['nx']*side*(f['hw']+3+15.9);oz=f['z']+f['nz']*side*(f['hw']+3+15.9)
    ry=math.atan2(dx,dz);c,s_=math.cos(ry),math.sin(ry);wx=ox+LX*c+LZ*s_;wz=oz-LX*s_+LZ*c
    gi=np.clip((wx/2).astype(int),0,RN-1);gj=np.clip((wz/2).astype(int),0,RN-1)
    if BLD[gj,gi].any() or RM[gj,gi].any():return None
    sv=SURF[gj,gi];fv=np.array([Hf(a,b) for a,b in zip(wx,wz)]);h=np.where(sv>-1e8,sv,fv)
    if h.max()-h.min()>2.2 or h.min()<1 or abs(float(np.median(h))-ry_)>1.2:return None
    return dict(x=ox,z=oz,ry=ry,y=float(np.median(h)),i=i,side=side,wx=wx,wz=wz)
best=None
for r in sorted([r for r in R if r['L']>200 and r['hw']>=3.5],key=lambda r:np.min(np.hypot(r['x']-dtx,r['z']-dtz)))[:400]:
    for i in range(3,len(r['x'])-3):
        d=math.hypot(r['x'][i]-dtx,r['z'][i]-dtz)
        if best and d>=best[0]:continue
        for side in(1,-1):
            g=lot(r,i,side)
            if g:best=(d,r,g);break
home=best[1];G0=best[2];sg=float(home['cum'][G0['i']])
# props, fences and barriers standing on the lot or across its drive are taken out by convert.py on the next run
json.dump(dict(x=G0['x'],z=G0['z'],ry=G0['ry'],rect=[-11.5,11.5,-9.5,15.85+3+.6]),open(EX+'/site.json','w'))
print('props on the lot / drive (dropped by the next convert)',int(WALL[gj_,gi_].sum()) if (gj_:=np.clip((G0['wz']/2).astype(int),0,RN-1)) is not None and (gi_:=np.clip((G0['wx']/2).astype(int),0,RN-1)) is not None else 0)
print('garage lot',round(G0['x']),round(G0['z']),'ground',round(G0['y'],1),'from downtown',round(best[0]),'road',home['id'],round(home['L']))
# trees out of the lot
tk=np.ones(len(trees),bool)
for a,b in zip(G0['wx'],G0['wz']):tk&=np.hypot(trees[:,0]-a,trees[:,2]-b)>4
trees=trees[tk];print('trees off the garage lot',int((~tk).sum()))
side=lambda f,lat:(f['x']+f['nx']*lat,f['z']+f['nz']*lat)
fg=at(home,sg);gx_,gz_=side(fg,G0['side']*(fg['hw']+4));poi('garage','YOUR GARAGE','#ffd34d','H','garage',gx_,gz_,G0['ry']+math.pi,15,road=home['id'],fx=fg['tx'],fz=fg['tz'],bld=1)
dirn=1 if home['L']-sg>sg else -1
spots=[('tune','TUNE SHOP','#4d7dff','T',110),('job','JOB BOARD','#4dffb0','J',215),('office','RACE OFFICE','#ff4dd2','R',320),('brand','BRAND CENTRAL','#4dd2ff','B',430),('gas','GAS STATION','#ff6a4d','G',540)]
avail=(home['L']-sg if dirn>0 else sg)-15;kk=min(1.,avail/560)
# the shops: a little cluster around the garage, each on its own stretch of road (55 m apart), open sky, level
cand_=[(r,i) for r in R if r['hw']>=3 for i in range(3,len(r['x'])-3,2)]
cx_=np.array([r['x'][i] for r,i in cand_]);cz_=np.array([r['z'][i] for r,i in cand_]);taken=[(fg['x'],fg['z'])];sp_=iter(spots)
for o in np.argsort(np.hypot(cx_-fg['x'],cz_-fg['z'])):
    r,i=cand_[o];x0,z0=float(r['x'][i]),float(r['z'][i])
    if any(math.hypot(x0-a,z0-b)<55 for a,b in taken):continue
    if not clear(x0,z0,float(r['y'][i]),2,2.5,2.5):continue
    f=frame(r,i);sd=1 if (f['nx']*(x0-fg['x'])+f['nz']*(z0-fg['z']))>=0 else -1
    if not clear(x0+f['nx']*sd*(f['hw']+6),z0+f['nz']*sd*(f['hw']+6),float(r['y'][i]),1,2.5,2.5):sd=-sd
    k,n,c,ic,off=next(sp_);x,z=side(f,sd*(f['hw']+6));poi(k,n,c,ic,k,x,z,math.atan2(-f['nx']*sd,-f['nz']*sd),15,road=r['id'],fx=f['tx'],fz=f['tz']);taken.append((x0,z0))
    if len(taken)>len(spots):break
f0=fg;spawn=dict(x=round(f0['x'],1),z=round(f0['z'],1),yaw=round(math.atan2(f0['tx']*dirn,f0['tz']*dirn),3))
GARAGE=dict(x=round(G0['x'],2),z=round(G0['z'],2),y=round(G0['y'],2),ry=round(G0['ry'],4))
# wide paved areas (lots): meet + drift
M=np.unpackbits(np.load(PK+'_roadmask.npy'))[:5120*5120].reshape(5120,5120).astype(bool)
D=ndimage.distance_transform_edt(M)*2
cells=np.argwhere(D>=14);vals=D[D>=14];order=np.argsort(-vals)
lots=[]
for o in order:
    j,i=cells[o];x,z=(i+.5)*2,(j+.5)*2
    if all(math.hypot(x-a,z-b)>500 for a,b,_ in lots):lots.append((x,z,float(vals[o])))
    if len(lots)>=6:break
print('lots',[(round(a),round(b),round(c)) for a,b,c in lots])
if lots:x,z,r_=lots[0];poi('meet','CAR MEET','#ffa24d','M','meet',x,z,0,min(64,r_*1.2),zone=1)
for x,z,r_ in lots[1:]:
    if far(x,z,600):poi('drift','DRIFT YARD','#b04dff','D','drift',x,z,0,min(110,r_*1.6),zone=1);break
# overlook: the highest road point
best=max(((r['y'][i],r,i) for r in R if r['hw']>=3 for i in range(3,len(r['x'])-3,3) if clear(r['x'][i],r['z'][i],r['y'][i],5)),key=lambda t:t[0])
_,r,i=best;poi('view','HILLTOP OVERLOOK','#ffffff','V','view',float(r['x'][i]),float(r['z'][i]),0,22)
# straights: top-speed run + speed traps
cands=[]
for r in R:
    n=len(r['x']);W=40
    if n<W+2:continue
    for i in range(0,n-W,5):
        a=np.arctan2(np.diff(r['x'][i:i+W+1]),np.diff(r['z'][i:i+W+1]));b=math.atan2(r['x'][i+W]-r['x'][i],r['z'][i+W]-r['z'][i])
        d=np.abs((a-b+np.pi)%(2*np.pi)-np.pi).max();dy=abs(r['y'][i+W]-r['y'][i])/(r['cum'][i+W]-r['cum'][i]+1e-6)
        if d<.28 and dy<.06:cands.append((-(d*100+dy*100)+r['hw'],r,i,W))
cands.sort(key=lambda t:-t[0]);run=None;nt=0
for sc,r,i,W in cands:
    x=(r['x'][i]+r['x'][i+W])/2;z=(r['z'][i]+r['z'][i+W])/2
    if not far(x,z,800):continue
    if run is None:
        run=dict(x0=float(r['x'][i]),z0=float(r['z'][i]),x1=float(r['x'][i+W]),z1=float(r['z'][i+W]),hw=r['hw']);poi('run','HARBOUR RUN','#ff9a3c','L','run',x,z,0,60,zone=1)
    else:
        nt+=1;poi('trap%d'%nt,'SPEED TRAP','#7dff4d','S','trap',x,z,math.atan2(r['x'][i+W]-r['x'][i],r['z'][i+W]-r['z'][i]),10,zone=1,road=r['id'])
    if nt>=4:break
# destinations spread over the map (job targets)
def nearroad(x,z):
    d=(allx-x)**2+(allz-z)**2;o=int(d.argmin());return float(allx[o]),float(allz[o])
x,z=nearroad(dtx,dtz);poi('borgo','DOWNTOWN','#ffa24d','D','town',x,z,0,26)
print('downtown',round(x),round(z))
names=[('rocco','HILLSIDE','#ffa24d','H'),('cala','BAYVIEW','#ffa24d','B'),('faro','POINT LIGHT','#ffffff','P'),('vale','OLD TOWN','#ffa24d','O')]
pts=np.stack([allx,allz],1);k=0
for o in np.random.default_rng(4).permutation(len(pts)):
    x,z=pts[o]
    if far(x,z,1250):
        id,n,c,ic=names[k];poi(id,n,c,ic,'town',float(x),float(z),0,26);k+=1
        if k>=len(names):break
# a checked arrival point for every stop (fast travel, job targets): the nearest road point with open sky and level ground
RP=[(r,i) for r in R if r['hw']>=3 for i in range(2,len(r['x'])-2)]
RPx=np.array([r['x'][i] for r,i in RP]);RPz=np.array([r['z'][i] for r,i in RP])
for p in pois:
    if p['id']=='garage':continue
    d=np.hypot(RPx-p['x'],RPz-p['z']);
    for o in np.argsort(d)[:400]:
        r,i=RP[o];y=float(r['y'][i])
        if clear(r['x'][i],r['z'][i],y,4):
            f=frame(r,i);p['tp']=[round(f['x'],1),round(f['z'],1),round(math.atan2(f['tx'],f['tz']),3),round(y,2)];break
    else:print('no clear arrival for',p['id'])
print('pois',[(p['id'],round(p['x']),round(p['z'])) for p in pois])
# map picture
from PIL import Image
im=Image.open(PK.rsplit('/',1)[0]+'/map2048.jpg').convert('RGB').resize((1536,1536),Image.LANCZOS);bio=io.BytesIO();im.save(bio,'JPEG',quality=80)
mapurl='data:image/jpeg;base64,'+base64.b64encode(bio.getvalue()).decode()
# road arrays as compact json
rj=[dict(id=r['id'],hw=r['hw'],x=[round(float(v),1) for v in r['x']],z=[round(float(v),1) for v in r['z']],y=[round(float(v),1) for v in r['y']]) for r in R]
tq=np.empty((len(trees),4),np.int16);tq[:,0]=np.round(trees[:,0]*2);tq[:,2]=np.round(trees[:,2]*2);tq[:,1]=np.round(trees[:,1]*8);tq[:,3]=np.round(trees[:,3]*16)+np.int16(0)
ttype=trees[:,4].astype(np.uint8)
toff=len(blob);extra=tq.tobytes()+ttype.tobytes()
while (toff+len(extra))%4:extra+=b'\0'
GARAGE.update(off=toff+len(extra),nv=len(GV),nf=len(GF));extra+=GV.astype(np.float32).tobytes()+GF.astype(np.uint16).tobytes()
while (toff+len(extra))%4:extra+=b'\0'
GARAGE['coff']=toff+len(extra);extra+=GCOL.astype(np.uint8).tobytes()
atlasurl='data:image/webp;base64,'+base64.b64encode(open(PK.rsplit('/',1)[0]+'/atlas.webp','rb').read()).decode()
import os as _os
_as=PK.rsplit('/',1)[0]+'/atlas_style.webp'
if _os.path.exists(_as):meta=dict(meta,atlasS='data:image/webp;base64,'+base64.b64encode(open(_as,'rb').read()).decode())
J=dict(meta,atlas=atlasurl,garage=GARAGE,trees=dict(off=toff,n=len(trees)),roads=rj,pois=pois,spawn=spawn,run=run,map=mapurl)
js=json.dumps(J,separators=(',',':')).encode()
raw=struct.pack('<I',len(js))+js+blob+extra
open(OUT,'wb').write(gzip.compress(raw,9))
print('pack raw MB',len(raw)/1e6,'gz MB',len(gzip.compress(raw,9))/1e6)
