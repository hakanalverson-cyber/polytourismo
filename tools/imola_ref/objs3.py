# clean low-poly object list from the survey: every building as a few massing boxes (up to 3 height levels) with banded facade colours,
# houses with pitched roofs, grandstands as raked seating with roofs, tents, vans/trucks and boards, each at its measured footprint
import numpy as np,json,collections
from scipy import ndimage
from scipy.spatial import cKDTree
S=np.load('spans.npy');hf=np.load('hf.npz');G1=hf['ground'];X0,Z0=-150,-200
bad=G1<-1e8;_,(ii,jj)=ndimage.distance_transform_edt(bad,return_indices=True);G1=G1[ii,jj]
MK=np.load('masks.npz');PAV=MK['road']|MK['kerb']|MK['aold']
T=json.load(open('../imT.json'));T=json.loads(T) if isinstance(T,str) else T;KD=cKDTree(np.c_[T['x'],T['z']])
D=np.load('tris.npz');C=np.load('cols.npz')
def gnd(x,z):return G1[np.clip(int(z-Z0),0,1699),np.clip(int(x-X0),0,2549)]
def paved_frac(cx,cz,a,L,W):
  u=np.linspace(-L/2,L/2,max(2,int(L)));v=np.linspace(-W/2,W/2,max(2,int(W)));U,V=np.meshgrid(u,v);c,s=np.cos(a),np.sin(a)
  x=cx+U*c-V*s;z=cz+U*s+V*c;i=np.clip(((z-Z0)/.5).astype(int),0,3399);j=np.clip(((x-X0)/.5).astype(int),0,5099);return PAV[i,j].mean()
def near_track(cx,cz):return KD.query([cx,cz])[0]
def rects(M,minside=2,maxn=8,cover=.92):
  M=M.copy();tot=M.sum();out=[];
  while M.sum()>0 and len(out)<maxn and (tot-M.sum())<cover*tot:
    # largest rectangle in binary matrix (histogram method)
    H,W=M.shape;h=np.zeros(W,int);best=(0,)
    for i in range(H):
      h=np.where(M[i],h+1,0);st=[]
      for j in range(W+1):
        cur=h[j] if j<W else 0;start=j
        while st and st[-1][1]>=cur:
          s0,hh=st.pop();area=hh*(j-s0)
          if area>best[0] and hh>=minside and (j-s0)>=minside:best=(area,i-hh+1,i+1,s0,j)
          start=s0
        st.append((start,cur))
    if best[0]==0:break
    _,i0,i1,j0,j1=best;M[i0:i1,j0:j1]=False;out.append((i0,i1,j0,j1))
  return out
def lin(c):return [int(x) for x in np.clip(c,0,255)]
import colorsys
def hexc(c):
  # snap a measured (texture-averaged, muddy) colour to a clean low-poly palette
  r,g,b=[x/255 for x in lin(c)];h,s_,v=colorsys.rgb_to_hsv(r,g,b)
  if s_>.38 and v>.28:
    hd=h*360
    if hd<18 or hd>335:return 0xc8242c
    if hd<45:return 0xc0603a
    if hd<70:return 0xe3b23c
    if hd<165:return 0x2e7d4f
    if hd<260:return 0x2a5fa8
    return 0x8a3a8c
  if v>.5:return 0xeceae6
  if v>.36:return 0xc9cbcc
  if v>.22:return 0x8d9196
  return 0x45494e
O=[]
# ---- per-group colour bands for buildings from wall triangles
def wall_bands(names,grp_mask_fn):
  pass
G=collections.defaultdict(list)
for r in S:G[(int(r[0]),int(r[1]))].append(r)
for (ci,g),rs in G.items():
  rs=np.array(rs);R=rs[0,7];DY=rs[0,6];ox,oz,ang=rs[0,8:11];u=rs[:,2].astype(int);v=rs[:,3].astype(int);u0,v0=u.min(),v.min();W=u.max()-u0+1;H=v.max()-v0+1
  ca,sa=np.cos(ang),np.sin(ang)
  def world(uc,vc):return ox+uc*ca-vc*sa,oz+uc*sa+vc*ca
  top=np.zeros((H,W));bot=np.full((H,W),1e9);grd=np.zeros((H,W),bool)
  np.maximum.at(top,(v-v0,u-u0),rs[:,5]*DY);np.minimum.at(bot,(v-v0,u-u0),rs[:,4]*DY);grd[v-v0,u-u0]|=rs[:,4]==0
  occ=top>0
  if ci in(0,1):  # buildings, houses
    Mg=ndimage.binary_opening(ndimage.binary_closing(grd&occ,iterations=1),iterations=1)
    if Mg.sum()*R*R<12:continue
    hs=top[Mg];lv=[]
    if ci==1:
      for (i0,i1,j0,j1) in rects(Mg,minside=3,maxn=3,cover=.85):
        uc=(u0+(j0+j1)/2)*R;vc=(v0+(i0+i1)/2)*R;x,z=world(uc,vc);L=(j1-j0)*R;Wd=(i1-i0)*R
        if L*Wd<12:continue
        sub=top[i0:i1,j0:j1][Mg[i0:i1,j0:j1]];O.append(dict(t='house',g=int(g),x=x,z=z,a=ang,L=L,W=Wd,h=float(np.percentile(sub,95)),e=float(np.percentile(sub,15))))
      continue
    # up to 3 levels: 1-D clustering of roof heights weighted by area
    q=np.sort(hs);
    for k in (3,2,1):
      cs=np.percentile(q,np.linspace(15,95,k));
      for _ in range(10):
        lab=np.argmin(abs(q[:,None]-cs[None]),1);cs=np.array([np.median(q[lab==i]) if (lab==i).any() else cs[i] for i in range(k)])
      cs=np.unique(np.round(cs*2)/2);
      if len(cs)==1 or np.min(np.diff(cs))>2.5:break
    cs=np.sort(cs)
    for li,hl in enumerate(cs):
      M=Mg&(top>=hl-(1.2 if li else 1e9))
      M=ndimage.binary_opening(M,iterations=1) if li else M
      for (i0,i1,j0,j1) in rects(M,minside=2 if li==0 else 3,maxn=6 if li==0 else 3):
        uc=(u0+(j0+j1)/2)*R;vc=(v0+(i0+i1)/2)*R;x,z=world(uc,vc);L=(j1-j0)*R;Wd=(i1-i0)*R
        if L*Wd<(15 if li==0 else 10) or min(L,Wd)<2.5 or hl<2.5:continue
        O.append(dict(t='house' if ci==1 else 'bld',g=int(g),x=x,z=z,a=ang,L=L,W=Wd,h=float(hl)))
  elif ci==5:  # grandstands: seating rakes up away from the track, roof where the survey has one above
    M=ndimage.binary_closing(occ,iterations=1)
    for (i0,i1,j0,j1) in rects(M,minside=2,maxn=4,cover=.85):
      L=(j1-j0)*R;Wd=(i1-i0)*R
      if L*Wd<20:continue
      uc=(u0+(j0+j1)/2)*R;vc=(v0+(i0+i1)/2)*R;x,z=world(uc,vc)
      sub=top[i0:i1,j0:j1];bs=bot[i0:i1,j0:j1];gm=(bs==0)
      prof=np.array([np.median(np.where(gm[:,k] if False else gm[k],sub[k],np.nan)[~np.isnan(np.where(gm[k],sub[k],np.nan))]) if gm[k].any() else 0 for k in range(sub.shape[0])])
      # across axis is v (rows) when the rect is long in u, else swap
      along_u=L>=Wd
      if along_u:pr=np.array([np.nanmedian(np.where(gm[k],sub[k],np.nan)) if gm[k].any() else np.nan for k in range(sub.shape[0])])
      else:pr=np.array([np.nanmedian(np.where(gm[:,k],sub[:,k],np.nan)) if gm[:,k].any() else np.nan for k in range(sub.shape[1])])
      pr=pr[~np.isnan(pr)] if np.isfinite(pr).any() else np.array([1.,1.])
      lo,hi=float(np.percentile(pr,10)),float(np.percentile(pr,90))
      el=(bs>2.5)&(bs<1e8);roof=float(np.median(sub[el])) if el.mean()>.3 else 0.
      # which side faces the track
      ax=np.array([ca,sa]) if not along_u else np.array([-sa,ca]);d1=near_track(*(np.array([x,z])+ax*5));d0=near_track(*(np.array([x,z])-ax*5))
      aa=ang if along_u else ang+np.pi/2;LL,WW=(L,Wd) if along_u else (Wd,L)
      vd=np.array([-np.sin(aa),np.cos(aa)]);P0=np.array([x,z])
      if near_track(*(P0+vd*WW/2))<near_track(*(P0-vd*WW/2)):aa+=np.pi   # front (-v) must face the track
      O.append(dict(t='stand',g=int(g),x=x,z=z,a=float(aa),L=LL,W=WW,lo=max(.8,lo),hi=max(lo+1,hi),roof=roof))
  elif ci==2:  # tents and stalls
    M=ndimage.binary_closing(occ,iterations=1)
    for (i0,i1,j0,j1) in rects(M,minside=4,maxn=10,cover=.8):
      L=(j1-j0)*R;Wd=(i1-i0)*R;uc=(u0+(j0+j1)/2)*R;vc=(v0+(i0+i1)/2)*R;x,z=world(uc,vc)
      if L*Wd<4:continue
      O.append(dict(t='tent',g=int(g),x=x,z=z,a=ang,L=L,W=Wd,h=float(np.percentile(top[i0:i1,j0:j1][occ[i0:i1,j0:j1]],80))))
P=json.load(open('pieces.json'))
for p in P:
  x,z=p['c'];gr=gnd(x,z);h=p['y1']-gr
  if p['m']=='Vehicles_001' and p['area']>12 and p['L']>3 and 1.2<h<5:
    O.append(dict(t='truck' if p['L']>7.5 else 'van',x=x,z=z,a=p['a'],L=p['L'],W=min(p['W'],2.6),h=h,c=hexc(p['wc'])))
  if p['m'] in('Pannello_Skin_00_001','Main_board_001','billboard1_001') and p['L']>2 and p['area']>1.5:
    O.append(dict(t='board',src='pan' if p['m']=='Pannello_Skin_00_001' else 'mb',x=x,z=z,a=p['a'],L=p['L'],W=max(.15,min(p['W'],.4)),h=p['y1']-gr,b=max(0,p['y0']-gr),c=hexc(p['tc'])))
# colours per building group from its wall/roof triangles, three bands by height
CLB=['buildings_003','buildings_001','b5_001','paddock_001','garages_001','tower_wall_001','windows_001','garage_spons_001','grilles_001','tower_spons_001','box_wall_001','pit_conc_001','bar_001','soveny_001']
TT=np.concatenate([D[n] for n in CLB]).astype(float);CC=np.concatenate([C[n] for n in CLB]).astype(float)
c=TT.mean(1);ix=(c[:,0]-X0).astype(int);iz=(c[:,2]-Z0).astype(int);ok=(ix>=0)&(iz>=0)&(ix<2550)&(iz<1700)
Gm=np.zeros((1700,2550),bool);Gm[iz[ok],ix[ok]]=True;lab,n=ndimage.label(ndimage.binary_dilation(Gm,iterations=1));L=np.zeros(len(c),int);L[ok]=lab[iz[ok],ix[ok]]
nr=np.cross(TT[:,1]-TT[:,0],TT[:,2]-TT[:,0]);ar=np.linalg.norm(nr,axis=1)/2;upf=np.abs(nr[:,1])/(2*ar+1e-9)>.7
gy=np.array([gnd(a,b) for a,b in c[:,[0,2]]]);hr=c[:,1]-gy
band={};roofc={}
for gi in np.unique(L[L>0]):
  m=(L==gi)
  w=m&~upf;tp=m&upf
  if w.sum():
    H_=np.percentile(hr[w],95);bs=[]
    for lo,hi in((0,.4),(.4,.75),(.75,1.01)):
      mm=w&(hr>=lo*H_)&(hr<hi*H_)
      bs.append(hexc((CC[mm]*ar[mm,None]).sum(0)/ar[mm].sum()) if mm.any() else None)
    band[int(gi)]=bs
  if tp.any():roofc[int(gi)]=hexc((CC[tp]*ar[tp,None]).sum(0)/ar[tp].sum())
# attach colours: building group ids differ from objs2's numbering, so look up by position
for o in O:
  if o['t']=='bld':
    gi=lab[int(np.clip(o['z']-Z0,0,1699)),int(np.clip(o['x']-X0,0,2549))]
    o['bands']=band.get(int(gi));o['roof']=roofc.get(int(gi))
# drop anything on the track or pit lane, and anything inside the hand-built pit building, paddock block and tower
HAND=[(1213,1330,152,204),(1327,1584,175,206),(1128,1162,152,176)]
K=[]
for o in O:
  if any(a<=o['x']<=b and c<=o['z']<=d for a,b,c,d in HAND) and o['t'] in('bld','stand','board','house'):continue
  if o['t']=='board' and o.get('src')=='pan':continue
  if o['t'] in('bld','house','stand','tent','van','truck','board'):
    pf=paved_frac(o['x'],o['z'],o['a'],o['L'],o['W']);dt=near_track(o['x'],o['z'])
    if o['t'] in('van','truck') and pf>.5 and dt<30:continue
    if o['t']!='van' and o['t']!='truck' and pf>.3 and dt<30:continue
  K.append(o)
json.dump(K,open('objs3.json','w'),default=float)
print(len(O),len(K),collections.Counter(o['t'] for o in K))
