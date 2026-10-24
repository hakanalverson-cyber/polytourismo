"""Minimal reader for Quaternius (CC0) Blender-exported .usda props: meshes, face subsets, flat material colours.
Returns triangles (Y-up, metres) with one colour per triangle. Enough for the nature packs; not a general USD reader."""
import re,numpy as np
def _arr(s,key,conv):
    m=re.search(re.escape(key)+r'\s*=\s*\[(.*?)\]',s,re.S)
    if not m:return None
    return conv(m.group(1))
def _pts(t):return np.array([[float(v) for v in q.split(',')] for q in re.findall(r'\(([^()]*)\)',t)])
def _ints(t):return np.array([int(v) for v in re.findall(r'-?\d+',t)])
def _blocks(s,kind):
    out=[];i=0
    while True:
        m=re.compile(r'def '+kind+r' "([^"]+)"').search(s,i)
        if not m:return out
        j=s.index('{',m.end());d=1;k=j+1
        while d:
            if s[k]=='{':d+=1
            elif s[k]=='}':d-=1
            k+=1
        out.append((m.group(1),s[m.start():k],m.start()));i=k
def _xf(block):
    """local transform of an Xform/Mesh block (translate, rotateXYZ deg, scale), as 4x4"""
    M=np.eye(4)
    head=block.split('def ',2)[1] if block.count('def ')>1 else block
    t=re.search(r'xformOp:translate\s*=\s*\(([^)]*)\)',head);r=re.search(r'xformOp:rotateXYZ\s*=\s*\(([^)]*)\)',head);sc=re.search(r'xformOp:scale\s*=\s*\(([^)]*)\)',head)
    T=np.eye(4);R=np.eye(4);S=np.eye(4)
    if t:T[:3,3]=[float(v) for v in t.group(1).split(',')]
    if sc:S[:3,:3]=np.diag([float(v) for v in sc.group(1).split(',')])
    if r:
        ax,ay,az=np.radians([float(v) for v in r.group(1).split(',')])
        Rx=np.array([[1,0,0],[0,np.cos(ax),-np.sin(ax)],[0,np.sin(ax),np.cos(ax)]]);Ry=np.array([[np.cos(ay),0,np.sin(ay)],[0,1,0],[-np.sin(ay),0,np.cos(ay)]]);Rz=np.array([[np.cos(az),-np.sin(az),0],[np.sin(az),np.cos(az),0],[0,0,1]])
        R[:3,:3]=Rz@Ry@Rx
    return T@R@S
def load(path):
    s=open(path).read()
    mats={}
    for name,b,_ in _blocks(s,'Material'):
        c=re.search(r'diffuseColor\s*=\s*\(([^)]*)\)',b);mats[name]=[float(v) for v in c.group(1).split(',')] if c else [.5,.5,.5]
    root=_xf(s[s.index('def Xform "root"'):s.index('{',s.index('def Xform "root"'))+200])
    tris=[];cols=[]
    xforms=_blocks(s,'Xform')
    for name,b,pos in _blocks(s,'Mesh'):
        P=_arr(b,'point3f[] points',_pts);C=_arr(b,'int[] faceVertexCounts',_ints);I=_arr(b,'int[] faceVertexIndices',_ints)
        if P is None or C is None:continue
        # parent Xform transforms (any Xform block that contains this mesh, innermost last)
        M=root.copy()
        for xn,xb,xp in xforms:
            if xn=='root':continue
            if xp<pos<xp+len(xb):M=M@_xf(xb)
        M=M@_xf(b)
        Pw=(np.c_[P,np.ones(len(P))]@M.T)[:,:3]
        fm=np.full(len(C),-1);mb=re.search(r'rel material:binding = </root/_materials/([^>]+)>',b);default=mats.get(mb.group(1)) if mb else [.5,.5,.5]
        names=[]
        for sn,sb,_ in _blocks(b,'GeomSubset'):
            ix=_arr(sb,'int[] indices',_ints);mm=re.search(r'rel material:binding = </root/_materials/([^>]+)>',sb);names.append(mats.get(mm.group(1),default) if mm else default);fm[ix]=len(names)-1
        o=0
        for f,n in enumerate(C):
            col=names[fm[f]] if fm[f]>=0 else default
            for q in range(1,n-1):tris.append([Pw[I[o]],Pw[I[o+q]],Pw[I[o+q+1]]]);cols.append(col)
            o+=n
    # USD root is Z-up rotated to Y-up by rotateXYZ(-90,0,0) already applied
    return np.array(tris),np.array(cols)
