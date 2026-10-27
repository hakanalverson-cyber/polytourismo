# drop stretched triangles from see-through (alpha) meshes in a built .ptrack: a few fence faces in the bought models join posts
# hundreds of metres apart and draw as long streaks across the track. usage: fixlong.py <file.ptrack> [max edge m]
import gzip,json,base64,sys,numpy as np
f=sys.argv[1];MX=float(sys.argv[2]) if len(sys.argv)>2 else 40.;J=json.loads(gzip.open(f).read());A=set(J.get('alpha',[]));n=0
for m in J['meshes']:
  if m['m'] not in A or 'TEXT' in m['m']:continue  # Bathurst's big hillside letters are meant to be that size
  p=np.frombuffer(base64.b64decode(m['p']),np.int16).reshape(-1,3)*m['q']+np.array(m['o'])
  dt=np.uint32 if m.get('i32') else np.uint16;i=np.frombuffer(base64.b64decode(m['i']),dt).reshape(-1,3)
  t=p[i];e=np.linalg.norm(t-np.roll(t,1,1),axis=2).max(1);k=e<=MX
  if k.all():continue
  n+=(~k).sum();m['i']=base64.b64encode(i[k].astype(dt).tobytes()).decode()
print(f,'dropped',n)
if n:open(f,'wb').write(gzip.compress(json.dumps(J,separators=(',',':')).encode(),6))
