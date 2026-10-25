# every built object of the reference model as low-poly blocks: sample each class's surfaces into voxels in each object group's own
# wall-aligned frame, turn each voxel column into vertical spans (solid to the ground for buildings, open under roofs/canopies for stands,
# tents and structures), merge equal neighbouring spans into boxes; colour = palette-quantised surface colour (top and side)
import numpy as np,json,sys
from scipy import ndimage
from scipy.cluster.vq import kmeans2
D=np.load('tris.npz');C=np.load('cols.npz');hf=np.load('hf.npz');G1=hf['ground'];X0,Z0=-150,-200
G0=G1.copy();bad=G1<-1e8;_,(ii,jj)=ndimage.distance_transform_edt(bad,return_indices=True);G1=G1[ii,jj]
# class: materials, cell size, vertical step, mode (solid|span), gap merged (m), lowest span extended to ground if within (m)
CL=[
 ('bld',['buildings_003','buildings_001','b5_001','paddock_001','garages_001','tower_wall_001','windows_001','garage_spons_001','grilles_001','tower_spons_001','box_wall_001','pit_conc_001','bar_001','soveny_001'],1.0,1.0,'span',4.5,6),
 ('house',['houses_add_001'],1.0,1.0,'solid',0,0),
 ('tent',['GENERIC_tent_001','Gazebo_Tent_003','Parasol_001','Mobile_Shops_001','GENERIC_Truck_Block_001'],.5,.25,'span',.6,1.5),
 ('veh',['Vehicles_001','f40_001'],.5,.5,'solid',0,0),
 ('props',['objects1_001','objects1_003','Pitlane_Props_BASE_001','metals_003','podium_001','bronze_001','tributes_001','pitsign_001','Main_board_001','display01_001','billboard1_001','bridges_sponsor_001','glob_logos_001','details_add_001','tyres_add2_001','Pannello_Skin_00_001'],.75,.5,'span',.75,1.5),
 ('stand',['gstand_001','seats_001','gr_seats_001','stand_001','scaffold_001','railing_001','outwalk_001'],1.0,.5,'span',1.5,5),
 ('struct',['StartBridgeStructure_001','StartBridgeFrontPanel_001','StartBridgeBackDisplay_001','galvanized_001','bridges_001'],.5,.25,'span',.5,.5),
 ('pole',['Digiflag_pole_001','digiflag_001','red_light_001','green_light_001','lightmat_001'],.5,.25,'span',.5,.5),
]
def ground(x,z):
  i=np.clip((z-Z0).astype(int),0,G1.shape[0]-1);j=np.clip((x-X0).astype(int),0,G1.shape[1]-1);return G1[i,j]
def samples(T,step):
  # points over each triangle, spacing <= step
  e=np.stack([np.linalg.norm(T[:,1]-T[:,0],axis=1),np.linalg.norm(T[:,2]-T[:,1],axis=1),np.linalg.norm(T[:,0]-T[:,2],axis=1)],1).max(1)
  n=np.clip(np.ceil(e/step),1,1500).astype(int);P=[];I=[]
  for k in np.unique(n):
    sel=np.where(n==k)[0];a,b=np.meshgrid(np.arange(k+1),np.arange(k+1));m=(a+b)<=k;a=a[m]/k;b=b[m]/k
    t=T[sel];p=t[:,None,0]*(1-a-b)[None,:,None]+t[:,None,1]*a[None,:,None]+t[:,None,2]*b[None,:,None]
    P.append(p.reshape(-1,3));I.append(np.repeat(sel,len(a)))
  return np.concatenate(P),np.concatenate(I)
allcol=[];rows=[]
for ci,(cl,names,R,DY,mode,gap,ext) in enumerate(CL):
  ns=[n for n in names if n in D.files];T=np.concatenate([D[n] for n in ns]).astype(np.float64);Cc=np.concatenate([C[n] for n in ns]).astype(np.float32)
  c=T.mean(1);i_=np.clip((c[:,2]-Z0).astype(int),0,1699);j_=np.clip((c[:,0]-X0).astype(int),0,2549);ok=~bad[i_,j_]|True;ok&=(c[:,0]>X0)&(c[:,2]>Z0)&(c[:,0]<X0+2550)&(c[:,2]<Z0+1700);T=T[ok];Cc=Cc[ok];c=c[ok]
  ix=(c[:,0]-X0).astype(int);iz=(c[:,2]-Z0).astype(int);Gm=np.zeros((1700,2550),bool);Gm[iz,ix]=True
  lab,n=ndimage.label(ndimage.binary_dilation(Gm,iterations=1));L=lab[iz,ix]
  # per group frame: origin = mean, angle = dominant horizontal edge direction (mod 90 deg)
  ox=np.bincount(L,c[:,0],n+1)/np.maximum(np.bincount(L,None,n+1),1);oz=np.bincount(L,c[:,2],n+1)/np.maximum(np.bincount(L,None,n+1),1)
  cs=np.zeros(n+1);sn=np.zeros(n+1)
  for a,b in((0,1),(1,2),(2,0)):
    d=T[:,b]-T[:,a];w=np.hypot(d[:,0],d[:,2]);th=np.arctan2(d[:,2],d[:,0])*4
    cs+=np.bincount(L,w*np.cos(th),n+1);sn+=np.bincount(L,w*np.sin(th),n+1)
  ang=np.arctan2(sn,cs)/4
  ext_=np.zeros(n+1)
  P,I=samples(T,R*.45);lp=L[I];col=Cc[I]
  ca=np.cos(ang[lp]);sa=np.sin(ang[lp]);dx=P[:,0]-ox[lp];dz=P[:,2]-oz[lp]
  iu=np.floor((dx*ca+dz*sa)/R).astype(np.int64);iv=np.floor((-dx*sa+dz*ca)/R).astype(np.int64);iy=np.floor(P[:,1]/DY).astype(np.int64)
  # skip huge groups (backdrop)
  span_u=np.zeros(n+1);
  key=((lp.astype(np.int64)*4096+(iu+2048))*4096+(iv+2048))*4096+(iy+1024)
  uk,inv=np.unique(key,return_inverse=True);cnt=np.bincount(inv);vc=np.stack([np.bincount(inv,col[:,k]) for k in range(3)],1)/cnt[:,None]
  yv=uk%4096-1024;colk=uk//4096
  # columns
  ucol,cinv=np.unique(colk,return_inverse=True);order=np.lexsort((yv,cinv));
  starts=np.r_[0,np.flatnonzero(np.diff(cinv[order]))+1,len(order)]
  for s0,s1 in zip(starts[:-1],starts[1:]):
    o=order[s0:s1];ck=ucol[cinv[o[0]]];g=int(ck//(4096*4096));u=int((ck//4096)%4096-2048);v=int(ck%4096-2048)
    ys=yv[o];cc=vc[o]
    uc=(u+.5)*R;vcn=(v+.5)*R;wx=ox[g]+uc*np.cos(ang[g])-vcn*np.sin(ang[g]);wz=oz[g]+uc*np.sin(ang[g])+vcn*np.cos(ang[g])
    gr=float(ground(np.array([wx]),np.array([wz]))[0])
    # spans
    sp=[];a=ys[0];b=ys[0];ia=0
    for k in range(1,len(ys)):
      if (ys[k]-b-1)*DY<=gap:b=ys[k]
      else:sp.append((a,b,ia,k));a=b=ys[k];ia=k
    sp.append((a,b,ia,len(ys)))
    if mode=='solid':sp=[(sp[0][0],sp[-1][1],0,len(ys))]
    for si,(a,b,i0,i1) in enumerate(sp):
      bot=a*DY-gr;top=(b+1)*DY-gr
      if top<=.05:continue
      if (si==0 and bot<ext) or mode=='solid':bot=0.
      top=max(top,bot+DY)
      tc=cc[i1-1];sc=cc[i0:i1].mean(0) if i1-i0>1 else tc
      rows.append([ci,g,u,v,round(bot/DY),round(top/DY),DY,R,ox[g],oz[g],ang[g]]);allcol.append(np.r_[tc,sc])
  print(cl,len(T),'tris',n,'groups',len(rows),'spans so far',flush=True)
rows=np.array(rows,np.float64);allcol=np.array(allcol,np.float32)
# palette
Cs=np.r_[allcol[:,:3],allcol[:,3:]];
np.random.seed(1);pal,_=kmeans2(Cs[np.random.choice(len(Cs),min(60000,len(Cs)),False)],40,minit='++',seed=1)
def q(x):return np.argmin(((x[:,None,:]-pal[None])**2).sum(2),1)
qt=np.concatenate([q(allcol[i:i+50000,:3]) for i in range(0,len(allcol),50000)]);qs=np.concatenate([q(allcol[i:i+50000,3:]) for i in range(0,len(allcol),50000)])
np.save('spans.npy',np.c_[rows,qt,qs]);np.save('pal.npy',pal);print(len(rows),'spans')
