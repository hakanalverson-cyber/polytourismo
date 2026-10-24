"""Place the Nordschleife corner marks on the real (OSM) line.
Positions: section kilometres from nordschleife-erfahren.de (tourist km, entry at Doettinger Hoehe; T13 = tourist ~1.9 km), shifted so
km 0 is T13, then snapped: Breidscheid to the lowest point (published lowest point), Karussell to the tightest left hairpin, Hohe Acht to
the high point after it, other corners to the nearest curvature peak within 250 m. Doettinger Hoehe starts at race km 17.26 (de.wikipedia)."""
import json,re,math,numpy as np
from scipy.ndimage import gaussian_filter1d
f='src/layers/ring_data.js';s=open(f).read();m=re.search(r'^(.*?=)(\{.*\})(;?\s*)$',s,re.S);h,d,t=m.group(1),json.loads(m.group(2)),m.group(3)
p=np.array(d['pts']);n=len(p);L=np.r_[0,np.cumsum(np.hypot(*np.diff(p[:,:2],axis=0).T))];tot=L[-1]+np.hypot(*(p[0,:2]-p[-1,:2]))
psi=np.unwrap(np.arctan2(np.gradient(p[:,1]),np.gradient(p[:,0])));k=gaussian_filter1d(np.gradient(psi)/np.gradient(L),2,mode='wrap')
y=p[:,2];km=lambda i:L[i]/1000;at=lambda x:int(np.argmin(np.abs(L-((x%(tot/1000))*1000))))
lo=int(np.argmin(y));off=9.6-km(lo)  # tourist km of Breidscheid
T={'HATZENBACH':2.55,'HOCHEICHEN':3.05,'QUIDDELBACHER HOHE':3.6,'FLUGPLATZ':4.3,'KOTTENBORN':4.85,'SCHWEDENKREUZ':5.2,'AREMBERG':5.75,'FUCHSROHRE':6.2,
 'ADENAUER FORST':6.8,'METZGESFELD':7.5,'KALLENHARD':8.3,'SPIEGELKURVE':8.8,'WEHRSEIFEN':9.3,'EX-MUHLE':9.85,'LAUDA-LINKS':10.15,'BERGWERK':10.6,
 'KESSELCHEN':11.5,'MUTKURVE':12.3,'KLOSTERTAL':12.75,'STEILSTRECKE':13.05,'HEDWIGSHOHE':15.0,'WIPPERMANN':15.3,'ESCHBACH':15.7,
 'BRUNNCHEN':16.3,'EISKURVE':16.6,'PFLANZGARTEN':16.95,'STEFAN-BELLOF-S':17.5,'SCHWALBENSCHWANZ':18.4,'KLEINES KARUSSELL':18.65,'GALGENKOPF':19.0,
 'ANTONIUSBUCHE':20.55,'TIERGARTEN':0.9,'HOHENRAIN':1.45}
M={'START / FINISH':0,'BREIDSCHEID':lo,'DOTTINGER HOHE':at(17.26)}
kar=[i for i in range(n) if 10.8<=km(i)+0<=12.4];M['KARUSSELL']=max(kar,key=lambda i:abs(k[i]))
ha=[i for i in range(M['KARUSSELL'],n) if km(i)<km(M['KARUSSELL'])+2];M['HOHE ACHT']=max(ha,key=lambda i:y[i])
peaks=[i for i in range(n) if abs(k[i])>=abs(k[i-1])and abs(k[i])>=abs(k[(i+1)%n]) and abs(k[i])>.004]
for nm,tk in T.items():
    i0=at(tk-off);c=[q for q in peaks if abs(L[q]-L[i0])<250]
    M[nm]=min(c,key=lambda q:abs(L[q]-L[i0])) if c else i0
d['marks']={a:int(b) for a,b in M.items()}
open(f,'w').write(h+json.dumps(d,separators=(',',':'))+t)
print('offset tourist-race km',round(off,2))
for a,b in sorted(M.items(),key=lambda e:e[1]):print(f'{a:20s} km {km(b):6.2f}  height {y[b]+145+340:5.0f} m  curv {k[b]:+.4f}')
