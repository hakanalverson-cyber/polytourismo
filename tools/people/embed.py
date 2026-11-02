# Packs the external textures of a glTF binary (.glb) into its buffer, so it loads from one file: python3 -I embed.py in.glb out.glb
import json,struct,sys,os
src,out=sys.argv[1],sys.argv[2]
b=open(src,'rb').read();n=struct.unpack('<I',b[12:16])[0];j=json.loads(b[20:20+n])
o=20+n;bl=struct.unpack('<I',b[o:o+4])[0];bin_=bytearray(b[o+8:o+8+bl])
base=os.path.dirname(src)
for im in j['images']:
  if 'uri' in im:
    data=open(os.path.join(base,im.pop('uri')),'rb').read()
    while len(bin_)%4:bin_.append(0)
    j['bufferViews'].append({'buffer':0,'byteOffset':len(bin_),'byteLength':len(data)});bin_+=data
    im['bufferView']=len(j['bufferViews'])-1;im['mimeType']='image/png'
while len(bin_)%4:bin_.append(0)
j['buffers'][0]['byteLength']=len(bin_)
js=json.dumps(j,separators=(',',':')).encode()
while len(js)%4:js+=b' '
tot=12+8+len(js)+8+len(bin_)
open(out,'wb').write(struct.pack('<III',0x46546C67,2,tot)+struct.pack('<II',len(js),0x4E4F534A)+js+struct.pack('<II',len(bin_),0x004E4942)+bin_)
