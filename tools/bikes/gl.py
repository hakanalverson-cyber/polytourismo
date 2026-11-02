import json,struct,numpy as np
CT={5120:np.int8,5121:np.uint8,5122:np.int16,5123:np.uint16,5125:np.uint32,5126:np.float32}
NC={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}
def qmat(q):
  x,y,z,w=q;return np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],[2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],[2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]])
def nmat(n):
  if 'matrix' in n: return np.array(n['matrix']).reshape(4,4).T
  M=np.eye(4);R=qmat(n.get('rotation',[0,0,0,1]));S=np.diag(n.get('scale',[1,1,1]));M[:3,:3]=R@S;M[:3,3]=n.get('translation',[0,0,0]);return M
def load(path):
  f=open(path,'rb').read();l=struct.unpack('<I',f[12:16])[0];j=json.loads(f[20:20+l]);o=20+l;bl=struct.unpack('<I',f[o:o+4])[0];B=f[o+8:o+8+bl]
  def acc(i):
    a=j['accessors'][i];bv=j['bufferViews'][a['bufferView']];n=NC[a['type']];dt=np.dtype(CT[a['componentType']]);st=bv.get('byteStride',0) or dt.itemsize*n
    off=bv.get('byteOffset',0)+a.get('byteOffset',0);cnt=a['count']
    arr=np.ndarray((cnt,n),dtype=dt,buffer=B,offset=off,strides=(st,dt.itemsize)).copy()
    if a.get('normalized'): arr=arr.astype(np.float32)/np.iinfo(dt).max
    return arr
  out=[]
  def walk(ni,M):
    n=j['nodes'][ni];M=M@nmat(n)
    if 'mesh' in n:
      for p in j['meshes'][n['mesh']]['primitives']:
        P=acc(p['attributes']['POSITION']).astype(np.float64);P=(M[:3,:3]@P.T).T+M[:3,3]
        I=acc(p['indices']).ravel() if 'indices' in p else np.arange(len(P))
        UV=acc(p['attributes']['TEXCOORD_0']) if 'TEXCOORD_0' in p['attributes'] else None
        mat=j['materials'][p['material']] if 'material' in p else {}
        out.append(dict(name=n.get('name',''),P=P,I=I.reshape(-1,3),UV=UV,mat=mat))
    for c in n.get('children',[]): walk(c,M)
  for r in j['scenes'][0]['nodes']: walk(r,np.eye(4))
  return j,out
