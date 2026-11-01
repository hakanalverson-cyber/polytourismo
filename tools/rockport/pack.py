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
tq=np.empty((len(trees),4),np.int16);tq[:,0]=np.round(trees[:,0]*2);tq[:,2]=np.round(trees[:,2]*2);tq[:,1]=np.round(trees[:,1]*8);tq[:,3]=np.round(trees[:,3]*16)+np.int16(0)
ttype=trees[:,4].astype(np.uint8)
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
cand=sorted([r for r in R if r['L']>600 and r['hw']>=4],key=lambda r:np.min(np.hypot(r['x']-mx,r['z']-mz)))
home=cand[0];print('home road',home['id'],round(home['L']),home['hw'])
side=lambda f,lat:(f['x']+f['nx']*lat,f['z']+f['nz']*lat)
spots=[('garage','YOUR GARAGE','#ffd34d','H',40),('tune','TUNE SHOP','#4d7dff','T',150),('job','JOB BOARD','#4dffb0','J',255),('office','RACE OFFICE','#ff4dd2','R',360),('brand','BRAND CENTRAL','#4dd2ff','B',470),('gas','GAS STATION','#ff6a4d','G',580)]
for k,n,c,ic,off in spots:
    f=at(home,min(off,home['L']-20));x,z=side(f,f['hw']+6);poi(k,n,c,ic,k,x,z,math.atan2(-f['nx'],-f['nz']),15,road=home['id'],fx=f['tx'],fz=f['tz'])
f0=at(home,40);spawn=dict(x=round(f0['x'],1),z=round(f0['z'],1),yaw=round(math.atan2(f0['tx'],f0['tz']),3))
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
best=max(((r['y'][i],r,i) for r in R for i in range(0,len(r['x']),3)),key=lambda t:t[0])
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
names=[('borgo','DOWNTOWN','#ffa24d','D'),('rocco','COLLEGE HILL','#ffa24d','C'),('cala','RIVERSIDE','#ffa24d','R'),('faro','POINT LIGHT','#ffffff','P')]
pts=np.stack([allx,allz],1);k=0
for o in np.random.default_rng(4).permutation(len(pts)):
    x,z=pts[o]
    if far(x,z,1600):
        id,n,c,ic=names[k];poi(id,n,c,ic,'town',float(x),float(z),0,26);k+=1
        if k>=len(names):break
print('pois',[(p['id'],round(p['x']),round(p['z'])) for p in pois])
# map picture
from PIL import Image
im=Image.open(PK.rsplit('/',1)[0]+'/map2048.jpg').convert('RGB').resize((1536,1536),Image.LANCZOS);bio=io.BytesIO();im.save(bio,'JPEG',quality=80)
mapurl='data:image/jpeg;base64,'+base64.b64encode(bio.getvalue()).decode()
# road arrays as compact json
rj=[dict(id=r['id'],hw=r['hw'],x=[round(float(v),1) for v in r['x']],z=[round(float(v),1) for v in r['z']],y=[round(float(v),1) for v in r['y']]) for r in R]
toff=len(blob);extra=tq.tobytes()+ttype.tobytes()
J=dict(meta,trees=dict(off=toff,n=len(trees)),roads=rj,pois=pois,spawn=spawn,run=run,map=mapurl)
js=json.dumps(J,separators=(',',':')).encode()
raw=struct.pack('<I',len(js))+js+blob+extra
open(OUT,'wb').write(gzip.compress(raw,9))
print('pack raw MB',len(raw)/1e6,'gz MB',len(gzip.compress(raw,9))/1e6)
