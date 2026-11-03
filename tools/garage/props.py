# Bake Hakan's career props (phone.glb, laptop.glb) into one compact flat-colour binary in the same format as garage_lp.bin.
# python3 tools/garage/props.py phone.glb laptop.glb props_lp.bin   (output stays in /mnt/project-files/poly-gt/packs/, never in git)
# The phone file lies tilted 45 degrees: it is stood up so its top is +y and its screen faces +z.
# Each group is centred on x/z with its base at y=0 and scaled to real size (phone 15 cm tall, laptop 32 cm wide).
import sys,json,struct,numpy as np,trimesh,fast_simplification
def lin(c):c=c/255.0;return np.where(c<=0.04045,c/12.92,((c+0.055)/1.055)**2.4)
def bake(fn,size,axis,target,rx=0):
    s=trimesh.load(fn,force='scene');tris=[];cols=[]
    for n in s.graph.nodes_geometry:
        T,g=s.graph[n];m=s.geometry[g]
        if not hasattr(m,'faces') or len(m.faces)==0:continue
        V=trimesh.transform_points(m.vertices,trimesh.transformations.rotation_matrix(rx,[1,0,0])@T);F=np.asarray(m.faces)
        mat=getattr(m.visual,'material',None);img=getattr(mat,'baseColorTexture',None) if mat is not None else None;uv=getattr(m.visual,'uv',None)
        fac=np.array(getattr(mat,'baseColorFactor',None) if mat is not None and getattr(mat,'baseColorFactor',None) is not None else [255,255,255,255],float)[:3];fac=fac/255 if fac.max()>1 else fac
        if len(F)>target:
            wm=trimesh.Trimesh(V,F,process=True);wm.merge_vertices(merge_tex=True,merge_norm=True)
            V2,F2=fast_simplification.simplify(np.asarray(wm.vertices,np.float32),np.asarray(wm.faces,np.int32),max(0.0,1-target/len(wm.faces)))
            from scipy.spatial import cKDTree
            _,idx=cKDTree(V).query(V2);uvs=uv[idx] if uv is not None else None;V,F=V2,F2
        else:uvs=uv
        if img is not None and uvs is not None:
            a=np.asarray(img.convert('RGB'),float);H,W=a.shape[:2];u=uvs[F].mean(1)
            x=(np.mod(u[:,0],1)*(W-1)).astype(int);y=((1-np.mod(u[:,1],1))*(H-1)).astype(int);c=lin(a[y,x])*fac
        else:c=np.tile(fac,(len(F),1))
        tris.append(V[F]);cols.append(c)
    t=np.concatenate(tris);c=np.concatenate(cols);mn=t.reshape(-1,3).min(0);mx=t.reshape(-1,3).max(0)
    k=size/(mx[axis]-mn[axis]);ct=(mn+mx)/2;t=(t-[ct[0],mn[1],ct[2]])*k
    print(fn,len(t),'faces',t.reshape(-1,3).min(0),t.reshape(-1,3).max(0),file=sys.stderr);return t,c
G={'phone':bake(sys.argv[1],.15,1,4000,np.pi/4),'laptop':bake(sys.argv[2],.32,0,1800)}
allv=np.concatenate([g[0].reshape(-1,3) for g in G.values()]);mn=allv.min(0);mx=allv.max(0)
hdr={'min':mn.tolist(),'max':mx.tolist(),'g':[]};blobs=[]
for k,(t,c) in G.items():
    q=np.round((t.reshape(-1,3)-mn)/(mx-mn)*65535).astype('<u2');cc=np.clip(np.round(np.power(np.clip(c,0,1),1/2.2)*255),0,255).astype('u1')
    hdr['g'].append({'k':k,'n':len(c)});blobs+=[q.tobytes(),cc.tobytes()]
h=json.dumps(hdr).encode();h+=b' '*((4-len(h)%4)%4)
open(sys.argv[3],'wb').write(struct.pack('<I',len(h))+h+b''.join(blobs))
