# Bake Hakan's Garage.zip (Garage.glb + textures/) into the compact career garage: python3 tools/garage/bake.py Garage.glb garage_lp.bin
# needs: pip install trimesh fast-simplification scipy. Output goes to /mnt/project-files/poly-gt/packs/ (never into git).
# Bake Hakan's Garage.glb into a compact low-poly vertex-colour mesh (custom binary).
import sys,json,struct,math,numpy as np,trimesh,fast_simplification
from scipy.spatial import cKDTree
src,out=sys.argv[1],sys.argv[2]
S=0.001
s=trimesh.load(src,force='scene')
SHELL=('Walls','Floor_','Door','Poster','Shelves','Table_Work','Locker','Fridge_Body','PegBoard','LightHousing')
def lin(c):c=c/255.0;return np.where(c<=0.04045,c/12.92,((c+0.055)/1.055)**2.4)
def sampler(m):
    mat=getattr(m.visual,'material',None);f=np.array([1,1,1,1.0])
    img=None
    if mat is not None:
        if getattr(mat,'baseColorFactor',None) is not None:f=np.array(mat.baseColorFactor,float);f=f/255 if f.max()>1.0 else f
        img=getattr(mat,'baseColorTexture',None)
    uv=getattr(m.visual,'uv',None)
    if img is not None and uv is not None:
        a=np.asarray(img.convert('RGB').resize((min(512,img.width),min(512,img.height))),float);H,W=a.shape[:2]
        def smp(u):
            x=(np.mod(u[:,0],1)*(W-1)).astype(int);y=((1-np.mod(u[:,1],1))*(H-1)).astype(int);return lin(a[y,x])*f[:3]
        return smp,uv
    c=np.array(f[:3]);return (lambda u:np.tile(c,(len(u),1))),None
groups={'shell':([],[]),'clutter':([],[])}
tot=0
for n in s.graph.nodes_geometry:
    T,g=s.graph[n];m=s.geometry[g]
    if not hasattr(m,'faces') or len(m.faces)==0:continue
    if n.startswith(('EngineBlock','Temp:','IMS_Humo')):continue
    smp,uv=sampler(m);V=trimesh.transform_points(m.vertices,T)*S;F=np.asarray(m.faces)
    k='shell' if n.startswith(SHELL) else 'clutter'
    if len(F)>3000:
        tgt=max(700,int(len(F)*0.05))
        vc=smp(uv) if uv is not None else smp(np.zeros((len(V),2)))
        wm=trimesh.Trimesh(V,F,process=True);wm.merge_vertices(merge_tex=True,merge_norm=True)
        V2,F2=fast_simplification.simplify(np.asarray(wm.vertices,np.float32),np.asarray(wm.faces,np.int32),max(0.0,1-tgt/len(wm.faces)))
        _,idx=cKDTree(V).query(V2);fc=vc[idx][F2].mean(1);fc=.75*np.median(fc,0)+.25*fc;tri=V2[F2]
    else:
        # subdivide so the texture shows up as flat-colour cells
        e=np.sqrt(2*np.linalg.norm(np.cross(V[F][:,1]-V[F][:,0],V[F][:,2]-V[F][:,0]),axis=1)/2)
        tg=0.035 if n.startswith(('Poster',)) else 0.05 if n.startswith(('Floor_Checker',)) else 0.12 if n.startswith(('Door',)) else 0.8 if n.startswith(('Floor_Cement','PegBoard')) else 0.45
        tris=[];cols=[]
        for i,f in enumerate(F):
            k2=int(min(48,max(1,math.ceil(e[i]/tg))));P=V[f];Uf=uv[f] if uv is not None else np.zeros((3,2))
            for a in range(k2):
                for b in range(k2-a):
                    for up in (0,1):
                        if up and b==k2-a-1:continue
                        bc=[(a,b),(a+1,b),(a,b+1)] if not up else [(a+1,b),(a+1,b+1),(a,b+1)]
                        w=np.array([[1-(i0+j0)/k2,i0/k2,j0/k2] for i0,j0 in bc])
                        tris.append(w@P);cols.append(w.mean(0)@Uf)
        tri=np.array(tris);fc=smp(np.array(cols))
        if not n.startswith(('Poster','Floor_Checker')):fc=.7*np.median(fc,0)+.3*fc
    groups[k][0].append(tri.astype(np.float32));groups[k][1].append(fc);tot+=len(tri)
    print(n[:30],len(F),'->',len(tri),file=sys.stderr)
print('total',tot,file=sys.stderr)
# binary: json header, then per group uint16 positions (non-indexed) + uint8 rgb per face
allv=np.concatenate([np.concatenate(g[0]).reshape(-1,3) for g in groups.values()]);mn=allv.min(0);mx=allv.max(0)
hdr={'min':mn.tolist(),'max':mx.tolist(),'g':[]};blobs=[]
for k,(ts,cs) in groups.items():
    t=np.concatenate(ts).reshape(-1,3);c=np.concatenate(cs)
    q=np.round((t-mn)/(mx-mn)*65535).astype('<u2');cc=np.clip(np.round(np.power(np.clip(c,0,1),1/2.2)*255),0,255).astype('u1')
    hdr['g'].append({'k':k,'n':len(c)});blobs+= [q.tobytes(),cc.tobytes()]
h=json.dumps(hdr).encode();h+=b' '*((4-len(h)%4)%4)
open(out,'wb').write(struct.pack('<I',len(h))+h+b''.join(blobs))
print(hdr,file=sys.stderr)
