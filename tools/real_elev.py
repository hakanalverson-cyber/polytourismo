"""Rebuild the elevation of the three real circuits from researched corner heights, leaving the traced layouts (x, z, width) untouched.
usage: python3 tools/real_elev.py   (rewrites src/layers/ra_data.js, imola_data.js, ring_data.js)

Sources (metres relative to each lap's lowest point; corner heights between published figures are estimates):
 Nordschleife: ~290 m between the highest points (T13 grandstand at km 0 and Hohe Acht) and the lowest (Breidscheid);
   climbs of up to 18 % between the Karussell and Hohe Acht, descents of up to 11 % in the Fuchsroehre (de.wikipedia Nordschleife);
   Flugplatz is a sharp climb then a drop, Kesselchen a long climb, Bruennchen and Pflanzgarten drop away (en.wikipedia Nuerburgring).
 Road Atlanta: 79 ft (24 m) of relief; T1 climbs steeply, braking for T3 on a crest, esses downhill then uphill to T5, 10a braked
   downhill, 10b exits uphill, T11 under the bridge then the fast downhill T12 (justtrackit, Allen Berg corner guide, wikipedia).
 Imola: Tosa is the low point near the river, steep climb to Piratella on a crest, drop through Acque Minerali, climb to the
   hilltop Variante Alta, downhill run into Rivazza (tracinginsights 2025 preview); about 55 m of climbing per lap (lapmeta).
"""
import json,re,math
import numpy as np
from scipy.interpolate import PchipInterpolator
from scipy.ndimage import gaussian_filter1d

def load(f):
    s=open(f).read();m=re.search(r'^(.*?=)(\{.*\})(;?\s*)$',s,re.S);return m.group(1),json.loads(m.group(2)),m.group(3)
def arc(p):
    L=[0.0]
    for i in range(1,len(p)):L.append(L[-1]+math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]))
    tot=L[-1]+math.hypot(p[0][0]-p[-1][0],p[0][1]-p[-1][1]);return np.array(L),tot
def profile(L,tot,keys,sigma,cap):
    """keys: [(distance m, height m)], periodic over the lap; pchip through them, light smoothing, grade capped"""
    k=sorted(keys);xs=[a-tot for a,_ in k[-3:]]+[a for a,_ in k]+[a+tot for a,_ in k[:3]];ys=[b for _,b in k[-3:]]+[b for _,b in k]+[b for _,b in k[:3]]
    y=PchipInterpolator(xs,ys)(L);step=tot/len(L)
    y=gaussian_filter1d(y,sigma,mode='wrap')
    for _ in range(400):
        dy=np.diff(np.r_[y,y[:1]]);
        if not (np.abs(dy)>step*cap).any():break
        y=gaussian_filter1d(y,1.0,mode='wrap')
    return y
def stats(name,y,L,tot):
    dy=np.diff(np.r_[y,y[:1]]);step=tot/len(y)
    print(f'{name}: relief {y.max()-y.min():.0f} m, climb/lap {dy[dy>0].sum():.0f} m, max up {dy.max()/step*100:.1f}%, max down {-dy.min()/step*100:.1f}%')
def save(f,head,d,tail):open(f,'w').write(head+json.dumps(d,separators=(',',':'))+tail)

# ---- Road Atlanta (keys by corner mark) ----
f='src/layers/ra_data.js';h,d,t=load(f);p=d['pts'];L,tot=arc(p);M=d['marks']
RA={'T11':22,'T12':12,'FS':2,'T1':1,'T2':12,'T3':20,'T4':17,'E1':13,'E2':8,'E3':7,'E4':9,'T5':14,'T6':12,'T7':10,'BS':11,'T8':14,'T9':10,'T10a':4,'T10b':7,'S2':15}
keys=[(L[M[k]],v) for k,v in RA.items()]+[(L[0],5),(L[(M['FS']+M['T1'])//2],0)]
y=profile(L,tot,keys,1.5,.12);y-=y[M['FS']];stats('Road Atlanta',y,L,tot)
for i,q in enumerate(p):q[2]=round(float(y[i]),1)
save(f,h,d,t)

# ---- Imola (keys by distance from the start line, km) ----
f='src/layers/imola_data.js';h,d,t=load(f);p=d['pts'];L,tot=arc(p)
IM=[(0,0),(.45,-1),(.75,-2),(1.15,-4),(1.72,-8),(2.05,4),(2.35,22),(2.6,12),(2.8,4),(3.0,8),(3.2,16),(3.45,24),(3.7,16),(3.95,6),(4.25,-1),(4.55,-1)]
y=profile(L,tot,[(a*1000*tot/4909,b) for a,b in IM],1.5,.10);y-=y[0];stats('Imola',y,L,tot)
for i,q in enumerate(p):q[2]=round(float(y[i]),1)
save(f,h,d,t)

# ---- Nordschleife (keys by corner mark; Breidscheid -145, T13 / Hohe Acht +145) ----
f='src/layers/ring_data.js';h,d,t=load(f);p=d['pts'];L,tot=arc(p);M=d['marks']
NR={'START / FINISH':145,'HATZENBACH':133,'HOCHEICHEN':112,'QUIDDELBACHER HOHE':120,'FLUGPLATZ':128,'KOTTENBORN':116,'SCHWEDENKREUZ':120,
 'AREMBERG':100,'FUCHSROHRE':82,'ADENAUER FORST':55,'METZGESFELD':35,'KALLENHARD':5,'SPIEGELKURVE':-25,'WEHRSEIFEN':-85,
 'BREIDSCHEID':-145,'EX-MUHLE':-140,'LAUDA-LINKS':-128,'BERGWERK':-105,'KESSELCHEN':-75,'MUTKURVE':0,'KLOSTERTAL':12,
 'STEILSTRECKE':25,'KARUSSELL':40,'HOHE ACHT':145,'HEDWIGSHOHE':140,'WIPPERMANN':132,'ESCHBACH':125,'BRUNNCHEN':105,
 'EISKURVE':100,'PFLANZGARTEN':75,'STEFAN-BELLOF-S':70,'SCHWALBENSCHWANZ':78,'KLEINES KARUSSELL':80,'GALGENKOPF':95,
 'DOTTINGER HOHE':100,'ANTONIUSBUCHE':130,'TIERGARTEN':138,'HOHENRAIN':142}
km=lambda k:L[M[k]]
keys=[(km(k),v) for k,v in NR.items()]
keys+=[((km('FUCHSROHRE')+km('ADENAUER FORST'))*.5+60,42)]                       # bottom of the Fuchsroehre dip before the climb to Adenauer Forst
keys+=[(km('KARUSSELL')+(km('HOHE ACHT')-km('KARUSSELL'))*.3,95)]              # the 16-18 % ramp out of the Karussell
y=profile(L,tot,keys,2.0,.18);stats('Nordschleife',y,L,tot)
for i,q in enumerate(p):q[2]=round(float(y[i]),1)
save(f,h,d,t)
