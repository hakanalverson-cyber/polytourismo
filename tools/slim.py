# keeps only the base colour map of every material, resized, and repacks the glb: slim.py in.glb out.glb maxpx
import json,struct,sys,os,io
from PIL import Image
src,out,mx=sys.argv[1],sys.argv[2],int(sys.argv[3])
b=open(src,'rb').read();n=struct.unpack('<I',b[12:16])[0];j=json.loads(b[20:20+n])
o=20+n;bl=struct.unpack('<I',b[o:o+4])[0];bin_=b[o+8:o+8+bl]
base=os.path.dirname(src)
def imgbytes(im):
    if 'uri' in im:return open(os.path.join(base,im['uri'].replace('%20',' ')),'rb').read()
    v=j['bufferViews'][im['bufferView']];return bin_[v.get('byteOffset',0):v.get('byteOffset',0)+v['byteLength']]
used={};newimgs=[];newtex=[];keep=bytearray()
# keep geometry buffer views that are not images
imgviews={im['bufferView'] for im in j.get('images',[]) if 'bufferView' in im}
newviews=[];vmap={}
for i,v in enumerate(j['bufferViews']):
    if i in imgviews:continue
    while len(keep)%4:keep.append(0)
    vmap[i]=len(newviews);nv=dict(v);nv['byteOffset']=len(keep);keep+=bin_[v.get('byteOffset',0):v.get('byteOffset',0)+v['byteLength']];newviews.append(nv)
for a in j['accessors']:
    if 'bufferView' in a:a['bufferView']=vmap[a['bufferView']]
for m in j['materials']:
    pm=m.setdefault('pbrMetallicRoughness',{});bt=pm.get('baseColorTexture')
    for k in('normalTexture','occlusionTexture','emissiveTexture'):m.pop(k,None)
    pm.pop('metallicRoughnessTexture',None);pm['metallicFactor']=0;pm['roughnessFactor']=.85
    if bt:
        t=j['textures'][bt['index']];si=t['source']
        if si not in used:
            im=Image.open(io.BytesIO(imgbytes(j['images'][si]))).convert('RGBA');im.thumbnail((mx,mx),Image.LANCZOS)
            op=im.getchannel('A').getextrema()[0]==255
            bio=io.BytesIO()
            if op:im.convert('RGB').save(bio,'JPEG',quality=86);mt='image/jpeg'
            else:im.save(bio,'PNG',optimize=True);mt='image/png'
            d=bio.getvalue()
            while len(keep)%4:keep.append(0)
            newviews.append({'buffer':0,'byteOffset':len(keep),'byteLength':len(d)});keep+=d
            newimgs.append({'bufferView':len(newviews)-1,'mimeType':mt});newtex.append({'source':len(newimgs)-1,'sampler':t.get('sampler',0)} if 'sampler' in t else {'source':len(newimgs)-1});used[si]=len(newtex)-1
        bt['index']=used[si]
j['images']=newimgs;j['textures']=newtex;j['bufferViews']=newviews
while len(keep)%4:keep.append(0)
j['buffers']=[{'byteLength':len(keep)}]
js=json.dumps(j,separators=(',',':')).encode()
while len(js)%4:js+=b' '
tot=12+8+len(js)+8+len(keep)
open(out,'wb').write(struct.pack('<III',0x46546C67,2,tot)+struct.pack('<II',len(js),0x4E4F534A)+js+struct.pack('<II',len(keep),0x004E4942)+bytes(keep))
