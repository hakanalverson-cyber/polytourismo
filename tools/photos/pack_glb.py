import sys,json,struct,os,io
from PIL import Image
src,dst,maxs=sys.argv[1],sys.argv[2],int(sys.argv[3])
b=open(src,'rb').read();jl=struct.unpack('<I',b[12:16])[0];J=json.loads(b[20:20+jl]);off=20+jl
bin_=b''
if off<len(b):bl=struct.unpack('<I',b[off:off+4])[0];bin_=b[off+8:off+8+bl]
bin_=bytearray(bin_);base=os.path.dirname(src)
def pad():
    while len(bin_)%4:bin_.append(0)
for im in J.get('images',[]):
    if 'uri' not in im:continue
    p=os.path.join(base,im['uri'].replace('%20',' '));I=Image.open(p);I.load()
    if max(I.size)>maxs:I.thumbnail((maxs,maxs),Image.LANCZOS)
    o=io.BytesIO();alpha=I.mode in('RGBA','LA') and I.getextrema()[-1][0]<255
    if alpha:I.save(o,'PNG',optimize=True);mt='image/png'
    else:I.convert('RGB').save(o,'JPEG',quality=90);mt='image/jpeg'
    d=o.getvalue();pad();J['bufferViews'].append({'buffer':0,'byteOffset':len(bin_),'byteLength':len(d)});bin_+=d;im['bufferView']=len(J['bufferViews'])-1;im['mimeType']=mt;del im['uri']
pad();J['buffers']=[{'byteLength':len(bin_)}]
js=json.dumps(J,separators=(',',':')).encode()
while len(js)%4:js+=b' '
out=struct.pack('<III',0x46546C67,2,12+8+len(js)+8+len(bin_))+struct.pack('<II',len(js),0x4E4F534A)+js+struct.pack('<II',len(bin_),0x004E4942)+bytes(bin_)
open(dst,'wb').write(out);print(dst,len(out))
