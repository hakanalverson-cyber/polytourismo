"""Bake Quaternius nature models (CC0 1.0, https://github.com/chibifire-stages/quaternius-stage) into src/layers/trees_q.js.
Each model is decimated per material colour (pyfqmr), normalised to 1 unit tall with the trunk base at the origin, and stored as
int16 positions + one palette index per triangle (flat shaded, vertex colours).
usage: python3 tools/tree_export.py <quaternius-stage/models> [--preview out.png]"""
import sys,os,base64,json,numpy as np,pyfqmr
sys.path.insert(0,os.path.dirname(__file__));from usda_mesh import load
PICK={ # name: (file, target triangles)
 'pine1':('UltimateNature/S_PineTree_1.usda',300),'pine2':('UltimateNature/S_PineTree_2.usda',300),
 'pine3':('UltimateNature/S_PineTree_3.usda',320),'pine4':('UltimateNature/S_PineTree_4.usda',280),
 'oak3':('UltimateNature/S_CommonTree_3.usda',300),'oak4':('UltimateNature/S_CommonTree_4.usda',280),
 'oak5':('UltimateNature/S_CommonTree_5.usda',300),'umb1':('UltimateNature/S_CommonTree_1.usda',300),
 'umb2':('UltimateNature/S_CommonTree_2.usda',300),'birch2':('UltimateNature/S_BirchTree_2.usda',260),
 'birch4':('UltimateNature/S_BirchTree_4.usda',320),'bush1':('UltimateNature/S_Bush_1.usda',90),'bush2':('UltimateNature/S_Bush_2.usda',90)}
def bake(path,target):
    tris,cols=load(path);keys=[tuple(np.round(c,3)) for c in cols];pal=sorted(set(keys));out_t=[];out_c=[]
    for pi,p in enumerate(pal):
        sel=tris[[k==p for k in keys]];v=sel.reshape(-1,3);u,inv=np.unique(np.round(v,5),axis=0,return_inverse=True);f=inv.reshape(-1,3)
        share=max(12,int(target*len(sel)/len(tris)))
        if len(f)>share:
            s=pyfqmr.Simplify();s.setMesh(u,f);s.simplify_mesh(target_count=share,aggressiveness=5,preserve_border=False,verbose=0);u,f,_=s.getMesh()
        out_t.append(u[f]);out_c+= [pi]*len(f)
    T=np.concatenate(out_t);y0=T[...,1].min();T[...,1]-=y0;h=T[...,1].max()
    base=T[T[...,1]<h*.05];cx,cz=(base[:,0].mean(),base[:,2].mean()) if len(base) else (0,0)
    T[...,0]-=cx;T[...,2]-=cz;T/=h
    return T,np.array(out_c,np.uint8),[list(map(float,p)) for p in pal],h

RUNTIME=r"""(function(){const P=window.PT8,TD=window.PT8_TREES;if(!P||!TD)return;const G={};
/* geometry for one baked model: flat-shaded triangles with per-vertex colour, 1 unit tall */
function geo(n){if(G[n])return G[n];const d=TD[n],dec=s=>{const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u};
 const q=new Int16Array(dec(d.p).buffer),ci=dec(d.c),pal=d.pal.map(h=>new THREE.Color(h)),pos=new Float32Array(q.length),col=new Float32Array(q.length);
 for(let i=0;i<q.length;i++)pos[i]=q[i]/16000;
 for(let t=0;t<ci.length;t++){const c=pal[ci[t]];for(let v=0;v<3;v++){const o=t*9+v*3;col[o]=c.r;col[o+1]=c.g;col[o+2]=c.b}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.computeVertexNormals();g.computeBoundingSphere();return G[n]=g}
/* plant a list of [x,y,z,scale,rotY] as instances of model n, h metres tall at scale 1; tints multiply the model colours per instance */
P.qTrees=(par,n,list,h,tints,o)=>{if(!list.length)return null;o=o||{};const m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.9,metalness:0,flatShading:true,side:THREE.DoubleSide}),im=new THREE.InstancedMesh(geo(n),m,list.length),ob=new THREE.Object3D(),c=new THREE.Color();
 list.forEach((p,i)=>{const s=p[3]*h,w=o.wide||1;ob.position.set(p[0],p[1]-(o.sink||.3),p[2]);ob.scale.set(s*w*(o.sx||1),s,s*w*(o.sx||1));ob.rotation.set(0,p[4]||0,0);ob.updateMatrix();im.setMatrixAt(i,ob.matrix);
  if(tints){c.setHex(tints[(Math.floor(Math.abs(p[0]*7+p[2]*13))%tints.length)]);im.setColorAt(i,c)}});
 im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;par.add(im);return im};
/* the same list spread across several models (every n-th instance to each) */
P.qMix=(par,names,list,hs,tints,o)=>names.forEach((n,j)=>P.qTrees(par,n,list.filter((p,i)=>i%names.length===j),Array.isArray(hs)?hs[j]:hs,tints,o));
P.qTreeNames=Object.keys(TD);
})();
"""
def main():
    root=sys.argv[1];data={};prev=[]
    for n,(f,t) in PICK.items():
        T,ci,pal,h=bake(os.path.join(root,f),t);q=np.clip(np.round(T*16000),-32767,32767).astype('<i2')
        data[n]={'p':base64.b64encode(q.tobytes()).decode(),'c':base64.b64encode(ci.tobytes()).decode(),
                 'pal':['#%02x%02x%02x'%tuple(int(min(1,c)*255+.5) for c in p) for p in pal]}
        prev.append((n,T,ci,pal));print(n,len(ci),'tris','src h %.1f m'%h)
    js='/* Quaternius "Ultimate Nature" trees and bushes, CC0 1.0 (https://quaternius.com, via github.com/chibifire-stages/quaternius-stage),\n   decimated and baked by tools/tree_export.py: p = int16 xyz/16000 (1 unit tall), c = palette index per triangle */\nwindow.PT8_TREES='+json.dumps(data,separators=(',',':'))+';\n'+RUNTIME
    open(os.path.join(os.path.dirname(__file__),'..','src','layers','trees_q.js'),'w').write(js);print(len(js)//1024,'KB')
    if '--preview' in sys.argv:
        import matplotlib;matplotlib.use('Agg');import matplotlib.pyplot as plt;from mpl_toolkits.mplot3d.art3d import Poly3DCollection
        fig=plt.figure(figsize=(3*len(prev),4))
        for i,(n,T,ci,pal) in enumerate(prev):
            ax=fig.add_subplot(1,len(prev),i+1,projection='3d');L=np.array([.3,.8,.5]);L/=np.linalg.norm(L)
            nr=np.cross(T[:,1]-T[:,0],T[:,2]-T[:,0]);nr/=np.linalg.norm(nr,axis=1,keepdims=True)+1e-9;sh=.45+.55*np.abs(nr@L)
            fc=np.array([pal[c] for c in ci])**(1/2.2)*sh[:,None]
            ax.add_collection3d(Poly3DCollection(T[:,:,[0,2,1]],facecolors=np.clip(fc,0,1),edgecolor='none'))
            ax.set_xlim(-.5,.5);ax.set_ylim(-.5,.5);ax.set_zlim(0,1);ax.axis('off');ax.set_title('%s %d'%(n,len(ci)),fontsize=8);ax.view_init(8,30)
        plt.savefig(sys.argv[sys.argv.index('--preview')+1],dpi=70,bbox_inches='tight')
main()
