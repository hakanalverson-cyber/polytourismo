# our own look for the original textures: grime smoothed away (edge-preserving), each texture reduced to a few clean colours
# (its pattern: windows, bricks, lane lines stay), colours livelier and lighter like the game's tracks and cars
import sys,os,glob,numpy as np
from PIL import Image
from skimage.restoration import denoise_tv_chambolle
from skimage.color import rgb2lab,lab2rgb
from scipy.cluster.vq import kmeans2
SRC,DST=sys.argv[1],sys.argv[2];os.makedirs(DST,exist_ok=True)
K=int(os.environ.get('K','6'));SAT=float(os.environ.get('SAT','1.45'));LIFT=float(os.environ.get('LIFT','1.12'))
for f in sorted(glob.glob(SRC+'/*')):
    n=os.path.basename(f);im=Image.open(f).convert('RGB');w,h=im.size
    s=min(1.,256/max(w,h));a=np.asarray(im.resize((max(8,int(w*s)),max(8,int(h*s))),Image.LANCZOS),np.float32)/255
    a=denoise_tv_chambolle(a,weight=.09,channel_axis=-1)
    lab=rgb2lab(a);X=lab.reshape(-1,3).astype(np.float64)
    try:
        c,l=kmeans2(X[::3] if len(X)>30000 else X,K,minit='++',seed=1,iter=10);d=((X[:,None,:]-c[None])**2).sum(-1);l=d.argmin(1);q=c[l]
    except Exception:q=X
    q=q.reshape(lab.shape)
    # livelier: chroma up, light up (dark grime reads as flat dark grey otherwise)
    # grass and foliage onto the game's fresh green (hue ~125 deg, more chroma), everything else just livelier
    hue=np.degrees(np.arctan2(q[...,2],q[...,1]))%360;ch=np.hypot(q[...,1],q[...,2])
    g=(hue>70)&(hue<170)&(ch>6)
    if g.mean()<.5:g[:]=False  # only grass / foliage textures, never a beige facade with a green tint
    nh=np.where(g,hue+(128-hue)*.8,hue);nc=np.where(g,ch*SAT*1.35+8,ch*SAT)
    q[...,1]=nc*np.cos(np.radians(nh));q[...,2]=nc*np.sin(np.radians(nh))
    q[...,0]=np.clip(q[...,0]*LIFT+6+np.where(g,4,0),0,100)
    out=np.clip(lab2rgb(q),0,1)
    Image.fromarray((out*255).astype(np.uint8)).resize((w,h),Image.NEAREST if max(w,h)<=256 else Image.BILINEAR).save(DST+'/'+n,'PNG')
print('styled',len(glob.glob(DST+'/*')))
