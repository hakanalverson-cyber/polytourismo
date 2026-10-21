#!/usr/bin/env python3
"""Split dist/Poly-Tourismo.html into a small index.html + data files so it fits the 16 MB artifact page limit."""
import re,os,sys,json
src=sys.argv[1] if len(sys.argv)>1 else 'dist/Poly-Tourismo.html';out=sys.argv[2] if len(sys.argv)>2 else '/tmp/art'
os.makedirs(out,exist_ok=True);s=open(src).read()
man=[];keep=[];pos=0;n=0
for m in re.finditer(r'<script([^>]*)>(.*?)</script>',s,re.S):
    keep.append(s[pos:m.start()]);pos=m.end();at=m.group(1)
    if 'src=' in at: keep.append(m.group(0));continue
    fn='d%02d.txt'%n;n+=1;open(os.path.join(out,fn),'w').write(m.group(2))
    idm=re.search(r'id="([^"]+)"',at);ty=re.search(r'type="([^"]+)"',at)
    man.append({'f':fn,'t':ty.group(1) if ty else '','id':idm.group(1) if idm else '','n':len(m.group(2))})
keep.append(s[pos:])
h=''.join(keep)
h=re.sub(r'<!DOCTYPE[^>]*>','',h,flags=re.I);h=re.sub(r'</?(html|head|body)[^>]*>','',h,flags=re.I);h=re.sub(r'<meta charset[^>]*>','',h,count=1)
loader="""<script>(async()=>{const M=%s,tot=M.reduce((a,x)=>a+x.n,0);let got=0;const fail=e=>{const d=document.createElement('div');d.style.cssText='position:fixed;inset:0;z-index:2147483647;background:#0b0e12;color:#fff;font:14px sans-serif;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center';d.textContent='Poly GT could not load ('+e+'). Reload the page.';document.documentElement.appendChild(d)};
try{const bar=document.getElementById('ptBootBar')||document.getElementById('ptBoot');const R=await Promise.all(M.map(async x=>{const r=await fetch(x.f);if(!r.ok)throw new Error(x.f+' '+r.status);const t=await r.text();got+=x.n;if(bar&&bar.style)bar.dataset.p=Math.round(got/tot*100);return t}));
M.forEach((x,i)=>{const e=document.createElement('script');if(x.t)e.type=x.t;if(x.id)e.id=x.id;e.text=R[i];document.body.appendChild(e)})}catch(e){fail(e&&e.message||e)}})();</script>"""%json.dumps(man)
# loader goes where the first game script was: after all markup (end of file)
open(os.path.join(out,'index.html'),'w').write(h.rstrip()+'\n'+loader)
print(len(h),'index bytes;',len(man),'data files')
