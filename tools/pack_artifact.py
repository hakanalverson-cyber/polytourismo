#!/usr/bin/env python3
"""Split dist/Poly-Tourismo.html into a small index.html + data files (<16 MB page limit for in-app artifacts).
Game code stays inline; only the big base64 blobs move to files, read with a synchronous same-origin XHR.
Music tracks are read lazily (textContent getter) so the first load is ~9 MB."""
import re,os,sys
src=sys.argv[1] if len(sys.argv)>1 else 'dist/Poly-Tourismo.html';out=sys.argv[2] if len(sys.argv)>2 else '/tmp/art'
os.makedirs(out,exist_ok=True);s=open(src).read();n=[0]
CH=15000000  # each published file stays under the 16 MB limit; bigger blobs become several parts read back to back
def dump(txt):
    fs=[]
    for i in range(0,max(1,len(txt)),CH):
        fn='d%02d.txt'%n[0];n[0]+=1;open(os.path.join(out,fn),'w').write(txt[i:i+CH]);fs.append(fn)
    return '+'.join('__ld("%s")'%f for f in fs)
def blk(m):
    at,body=m.group(1),m.group(2)
    if 'src=' in at or len(body)<300000: return m.group(0)
    if 'type="text/plain"' in at:
        fn=dump(body);idm=re.search(r'id="([^"]+)"',at).group(1)
        return '<script%s></script><script>__lazy("%s",function(){return %s})</script>'%(at,idm,fn)
    def cst(c):
        v=c.group(2)
        if len(v)<300000: return c.group(0)
        return 'var %s=%s'%(c.group(1),dump(v))
    body=re.sub(r'PT8_PACKS\.push\((\{.*?\})\);\n',lambda c:'PT8_PACKS.push(JSON.parse(%s));\n'%dump(c.group(1)),body,flags=re.S)  # built-in track files
    return '<script%s>%s</script>'%(at,re.sub(r'const (\w+)="([^"]*)"',cst,body))
h=re.sub(r'<script([^>]*)>(.*?)</script>',blk,s,flags=re.S)
h=re.sub(r'<!DOCTYPE[^>]*>','',h,flags=re.I);h=re.sub(r'</?(html|head|body)[^>]*>','',h,flags=re.I);h=re.sub(r'<meta charset[^>]*>','',h,count=1)
ldr='<script>function __ld(f){var x=new XMLHttpRequest();x.open("GET",f,false);x.send();if(x.status!==200&&x.status!==0)throw new Error(f+" "+x.status);return x.responseText}function __lazy(id,f){var e=document.getElementById(id),c=null;Object.defineProperty(e,"textContent",{get:function(){return c===null?(c=f()):c},configurable:true})}</script>'
i=h.index('<script')
h=h[:i]+ldr+h[i:]
open(os.path.join(out,'index.html'),'w').write(h)
print(len(h),'index bytes;',n[0],'data files')
