import json,struct,numpy as np,io
CT={5120:np.int8,5121:np.uint8,5122:np.int16,5123:np.uint16,5125:np.uint32,5126:np.float32}
NC={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}
def load(path):
    b=open(path,'rb').read()
    l=struct.unpack('<I',b[12:16])[0]; j=json.loads(b[20:20+l]); o=20+l
    bl=struct.unpack('<I',b[o:o+4])[0]; bin_=memoryview(b)[o+8:o+8+bl]
    return j,bin_
def acc(j,bin_,i):
    a=j['accessors'][i]; bv=j['bufferViews'][a['bufferView']]
    dt=CT[a['componentType']]; n=NC[a['type']]; off=bv.get('byteOffset',0)+a.get('byteOffset',0)
    st=bv.get('byteStride',0); isz=np.dtype(dt).itemsize*n
    if st and st!=isz:
        raw=np.frombuffer(bin_,dtype=np.uint8,count=st*(a['count']-1)+isz,offset=off)
        arr=np.lib.stride_tricks.as_strided(raw,(a['count'],isz),(st,1)).copy().view(dt).reshape(a['count'],n)
    else:
        arr=np.frombuffer(bin_,dtype=dt,count=a['count']*n,offset=off).reshape(a['count'],n)
    if a.get('normalized'):
        arr=arr.astype(np.float32)/np.iinfo(dt).max
    return arr
def nodemat(n):
    if 'matrix' in n: return np.array(n['matrix'],dtype=np.float64).reshape(4,4).T
    M=np.eye(4)
    t=n.get('translation',[0,0,0]); r=n.get('rotation',[0,0,0,1]); s=n.get('scale',[1,1,1])
    x,y,z,w=r
    R=np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],[2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],[2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]])
    M[:3,:3]=R*np.array(s); M[:3,3]=t; return M
def walk(j):
    """yield (mesh_index, world_matrix, label) where label is the nearest named ancestor that is not Object_*/root"""
    sc=j['scenes'][j.get('scene',0)]
    stack=[(i,np.eye(4),'') for i in sc['nodes']]
    while stack:
        i,P,lab=stack.pop(); n=j['nodes'][i]; M=P@nodemat(n); nm=n.get('name','')
        if nm and not nm.startswith('Object_') and nm not in('root','Sketchfab_model','GLTF_SceneRootNode') and not nm.endswith('.fbx'): lab=nm
        if 'mesh' in n: yield n['mesh'],M,lab
        for c in n.get('children',[]): stack.append((c,M,lab))
def image(j,bin_,ii):
    from PIL import Image
    im=j['images'][ii]; bv=j['bufferViews'][im['bufferView']]; o=bv.get('byteOffset',0)
    return Image.open(io.BytesIO(bytes(bin_[o:o+bv['byteLength']])))
