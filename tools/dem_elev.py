"""Real elevation for the three circuits.
Track lines: open-racetrack-db (OpenStreetMap traces, ODbL) - github.com/markthebault/open-racetrack-db
Heights: AWS Terrain Tiles (Mapzen terrarium; USGS 3DEP in the US, EU-DEM / SRTM in Europe) - registry.opendata.aws/terrain-tiles
Our traced layouts are registered onto the OSM line (rotation, scale, mirror, start offset fitted by least squares), then every
sample of our layout takes the DEM height of its matching point on the real line.
usage: python3 tools/dem_elev.py <ordb data dir> <tile cache dir> [--write]"""
import sys,os,json,re,math,io,urllib.request
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter1d,median_filter
DATA,CACHE=sys.argv[1],sys.argv[2];WRITE='--write' in sys.argv;os.makedirs(CACHE,exist_ok=True)
Z=15
def tile(x,y):
    p=f'{CACHE}/{Z}_{x}_{y}.png'
    if not os.path.exists(p):
        b=urllib.request.urlopen(f'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{Z}/{x}/{y}.png',timeout=60).read();open(p,'wb').write(b)
    a=np.asarray(Image.open(p).convert('RGB')).astype(np.float64);return a[...,0]*256+a[...,1]+a[...,2]/256-32768
TC={}
def height(lon,lat):
    n=2**Z;fx=(lon+180)/360*n*256;fy=(1-math.asinh(math.tan(math.radians(lat)))/math.pi)/2*n*256
    x0,y0=math.floor(fx-.5),math.floor(fy-.5);tx,ty=fx-.5-x0,fy-.5-y0
    def px(X,Y):
        k=(X//256,Y//256)
        if k not in TC:TC[k]=tile(*k)
        return TC[k][Y%256,X%256]
    return (px(x0,y0)*(1-tx)*(1-ty)+px(x0+1,y0)*tx*(1-ty)+px(x0,y0+1)*(1-tx)*ty+px(x0+1,y0+1)*tx*ty)
def resample(P,M):
    Q=np.vstack([P,P[:1]]);d=np.r_[0,np.cumsum(np.hypot(*np.diff(Q,axis=0).T))];t=np.linspace(0,d[-1],M,endpoint=False)
    return np.c_[np.interp(t,d,Q[:,0]),np.interp(t,d,Q[:,1])],d[-1]
def procrustes(A,B):  # best s,R,t with s*R*A+t ~ B
    ma,mb=A.mean(0),B.mean(0);A0,B0=A-ma,B-mb;U,S,Vt=np.linalg.svd(A0.T@B0);R=(U@Vt).T
    if np.linalg.det(R)<0:return None
    s=S.sum()/(A0**2).sum();E=s*(A0@R.T)-B0;return s,R,ma,mb,np.sqrt((E**2).sum(1).mean())
def load_ours(f):
    s=open(f).read();m=re.search(r'^(.*?=)(\{.*\})(;?\s*)$',s,re.S);return m.group(1),json.loads(m.group(2)),m.group(3)
TR=[('Nordschleife','germany/nurburgring/layouts/nordschleife.geojson','src/layers/ring_data.js'),
    ('Road Atlanta','united-states/road-atlanta-9292566/layouts/road-atlanta.geojson','src/layers/ra_data.js'),
    ('Imola','italy/imola/layouts/grand-prix.geojson','src/layers/imola_data.js')]
out={}
for name,gj,ours in TR:
    c=np.array(json.load(open(f'{DATA}/{gj}'))['features'][0]['geometry']['coordinates'])[:,:2]
    if np.allclose(c[0],c[-1]):c=c[:-1]
    lat0=c[:,1].mean();R_=6371008.8;E=np.c_[np.radians(c[:,0]-c[:,0].mean())*R_*math.cos(math.radians(lat0)),np.radians(c[:,1]-lat0)*R_]
    M=1200;Er,Lr=resample(E,M)
    h,d,t=load_ours(ours);p=np.array(d['pts'])[:,:2];Pr,Lo=resample(p,M)
    best=None
    for mir in (1,-1):
        A0=Pr*[1,mir]
        for rev in (False,True):
            A=A0[::-1] if rev else A0
            for sh in range(0,M,6):
                r=procrustes(np.roll(A,-sh,axis=0),Er)
                if r and (best is None or r[4]<best[0]):best=(r[4],mir,rev,sh,r)
    rms,mir,rev,sh,(s,R,ma,mb,_)=best
    # refine shift
    A=(Pr*[1,mir]);A=A[::-1] if rev else A
    for s2 in range(sh-6,sh+7):
        r=procrustes(np.roll(A,-s2,axis=0),Er)
        if r and r[4]<rms:rms,sh,(s,R,ma,mb,_)=r[4],s2,r
    # heights along the real line (dense), smoothed: median kills bridge/cutting spikes, gaussian ~25 m evens DEM noise
    Ed,Ld=resample(E,int(Lr/4));lonlat=np.c_[Ed[:,0]/(R_*math.cos(math.radians(lat0))),Ed[:,1]/R_]
    lon=np.degrees(lonlat[:,0])+c[:,0].mean();lat=np.degrees(lonlat[:,1])+lat0
    H=np.array([height(a,b) for a,b in zip(lon,lat)])
    Hs=gaussian_filter1d(median_filter(H,size=9,mode='wrap'),6,mode='wrap')
    # each of our samples -> nearest point on the registered real line
    Pw=(s*((p*[1,mir])-ma)@R.T)+mb
    from scipy.spatial import cKDTree
    di,ix=cKDTree(Ed).query(Pw)
    y=Hs[ix]
    out[name]=dict(s=s,R=R,ma=ma,mb=mb,rms=rms,scale=s,mir=mir,rev=rev,maxdev=float(di.max()),meddev=float(np.median(di)),H=H,Hs=Hs,Ld=Ld,Lr=Lr,Lo=Lo,y=y,old=np.array(d['pts'])[:,2],Pw=Pw,Ed=Ed)
    print(f'{name}: OSM {Lr:.0f} m, ours {Lo:.0f} m, fit rms {rms:.1f} m (scale {s:.3f}, mirror {mir}, reversed {rev}), our points off the real line: median {np.median(di):.1f} m, max {di.max():.0f} m; DEM relief {Hs.max()-Hs.min():.0f} m ({Hs.min():.0f}-{Hs.max():.0f} m asl)')
    if WRITE and name=='Nordschleife' and '--relayout' in sys.argv:
        # our traced loop is up to ~150 m off the real road: take the real OSM line instead, brought into our frame with the
        # inverse of the fit (so the world keeps its orientation), resampled at 12 m; widths and corner marks carry over from
        # the nearest point of the old loop
        Pg=((Ed-mb)@R)/s+ma;Pg=Pg*[1,mir]
        k0=ix[0];Pg=np.roll(Pg,-k0,axis=0);Hd=np.roll(Hs,-k0)
        Pn,Ln=resample(Pg,int(round(Ld/12)));n=len(Pn)
        Q=np.vstack([Pg,Pg[:1]]);dq=np.r_[0,np.cumsum(np.hypot(*np.diff(Q,axis=0).T))];tn=np.linspace(0,dq[-1],n,endpoint=False)
        Hn=np.interp(tn,dq,np.r_[Hd,Hd[:1]])
        Pn=Pn-Pn[0]
        old=np.array(d['pts']);po=old[:,:2]-old[0,:2]
        tr=cKDTree(Pn);_,mi=tr.query(po)
        hw=np.interp(np.arange(n),np.sort(mi),old[np.argsort(mi),3]) if False else None
        # widths: each new point takes the width of the nearest old point
        _,oi=cKDTree(po).query(Pn);hw=old[oi,3]
        marks={k:int(mi[v]) for k,v in d['marks'].items()};marks['START / FINISH']=0
        y2=Hn-Hn.min()-145
        d['pts']=[[round(float(Pn[i,0]),1),round(float(Pn[i,1]),1),round(float(y2[i]),1),round(float(hw[i]),2)] for i in range(n)];d['marks']=marks
        h='/* Nordschleife: OpenStreetMap trace (open-racetrack-db, ODbL), 12 m samples, 1 unit = 1 m; heights from AWS Terrain Tiles (EU-DEM/SRTM), smoothed. generated by tools/dem_elev.py */\nwindow.PT8_RING='
        open(ours,'w').write(h+json.dumps(d,separators=(',',':'))+';\n');print('  wrote real layout',n,'pts')
    elif WRITE and name!='Nordschleife':
        for i,q in enumerate(d['pts']):q[2]=round(float(y[i]-y[0]),1)
        open(ours,'w').write(h+json.dumps(d,separators=(',',':'))+t);print('  wrote heights')
import pickle;pickle.dump(out,open(f'{CACHE}/../dem_out.pkl','wb'))
