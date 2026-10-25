# 2.5D height fields (1 m cells) of every built object class in the reference model, plus model ground height
import numpy as np,sys
from skimage.draw import polygon
D=np.load('tris.npz');C=1.0;X0,Z0=-150,-200;W,H=int(2550/C),int(1700/C)
def hfield(names,mode='max'):
  top=np.full((H,W),-1e9 if mode=='max' else 1e9,np.float32);bot=np.full((H,W),1e9,np.float32)
  for n in names:
    if n not in D.files:continue
    for tri in D[n]:
      xs=(tri[:,0]-X0)/C;zs=(tri[:,2]-Z0)/C
      if xs.min()<0 or zs.min()<0 or xs.max()>=W-1 or zs.max()>=H-1:continue
      rr,cc=polygon(zs,xs,(H,W))
      if len(rr)==0:
        rr=np.array([int(zs.mean())]);cc=np.array([int(xs.mean())])
      # plane through the triangle: y at cell centres
      a,b,c=tri;n_=np.cross(b-a,c-a)
      if abs(n_[1])>1e-6:
        px=X0+(cc+.5)*C;pz=Z0+(rr+.5)*C;y=a[1]-(n_[0]*(px-a[0])+n_[2]*(pz-a[2]))/n_[1];y=np.clip(y,tri[:,1].min(),tri[:,1].max())
      else:y=np.full(len(rr),tri[:,1].max())
      if mode=='max':np.maximum.at(top,(rr,cc),y)
      else:np.minimum.at(top,(rr,cc),y)
      np.minimum.at(bot,(rr,cc),np.full(len(rr),tri[:,1].min()))
  return top,bot
G={
 'bld':['buildings_003','buildings_001','b5_001','paddock_001','garages_001','top_ext_001','tower_wall_001','windows_001','garage_spons_001','grilles_001','tower_spons_001','box_wall_001','pit_conc_001'],
 'house':['houses_add_001'],
 'tent':['GENERIC_tent_001','Gazebo_Tent_003','Parasol_001','Mobile_Shops_001','GENERIC_Truck_Block_001'],
 'veh':['Vehicles_001'],
 'props':['objects1_001','objects1_003','Pitlane_Props_BASE_001','metals_003','podium_001','bronze_001','tributes_001'],
 'stand':['gstand_001','seats_001','gr_seats_001','stand_001','scaffold_001','railing_001','outwalk_001'],
}
out={}
gt,_=hfield(['imola_a_001','imola_b_001','imola_c_001','imola_d_001','grass_001','asphalt_001','asphalt_dark_001','asph_old_001','green_001','sand_001'],'max')
out['ground']=gt
for k,v in G.items():
  t,b=hfield(v);out[k+'_top']=t;out[k+'_bot']=b;m=t>-1e8;print(k,m.sum(),'cells')
np.savez_compressed('hf.npz',**out)
