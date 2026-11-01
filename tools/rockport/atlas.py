# the original Rockport textures in one atlas: each texture shrunk (longest side <= 256, area <= 2*128^2), padded with its own
# wrapped edge so tiling (the game samples rect.xy + fract(uv)*rect.zw) has no seams, shelf-packed into a 4096 page -> WebP
import sys,os,json,glob,numpy as np
from PIL import Image
TD,OUT=sys.argv[1],sys.argv[2]
names=sorted(os.path.basename(f) for f in glob.glob(TD+'/*'))
PAD=8;AW=4096
items=[]
for n in names:
    im=Image.open(TD+'/'+n).convert('RGB');w,h=im.size
    s=min(1.,512/max(w,h),(256*256/(w*h))**.5)
    nw,nh=max(8,int(round(w*s))),max(8,int(round(h*s)))
    # power-of-two-ish sizes keep mip levels clean
    p2=lambda v:1<<int(round(np.log2(v)))
    nw,nh=min(512,p2(nw)),min(512,p2(nh))
    a=np.asarray(im.resize((nw,nh),Image.LANCZOS))
    items.append((n,a,np.asarray(im,np.float32).reshape(-1,3).mean(0)/255))
items.sort(key=lambda t:-t[1].shape[0])
x=y=0;sh=0;rects={};canvas=np.zeros((AW,AW,3),np.uint8)
for n,a,mc in items:
    h,w=a.shape[:2];W,H=w+2*PAD,h+2*PAD
    if x+W>AW:x=0;y+=sh;sh=0
    if y+H>AW:raise SystemExit('atlas full')
    canvas[y:y+H,x:x+W]=np.pad(a,((PAD,PAD),(PAD,PAD),(0,0)),mode='wrap')
    rects[n]=[(x+PAD)/AW,(y+PAD)/AW,w/AW,h/AW,[round(float(c),4) for c in mc],[w,h]]
    x+=W;sh=max(sh,H)
used=y+sh;print('textures',len(items),'atlas rows used',used,'of',AW)
AH=1<<int(np.ceil(np.log2(used)))
canvas=canvas[:AH]
for r in rects.values():r[1]=r[1]*AW/AH;r[3]=r[3]*AW/AH
Image.fromarray(canvas).save(OUT+'.webp',quality=80,method=6)
json.dump({'w':AW,'h':AH,'r':rects},open(OUT+'.json','w'))
print('atlas',AW,'x',AH,'webp KB',os.path.getsize(OUT+'.webp')//1024)
