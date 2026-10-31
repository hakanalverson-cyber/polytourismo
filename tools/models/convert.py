#!/usr/bin/env python3
"""Turn textured GLB models into the game's low-poly look.
  1. gather the source triangles (world space) with their texture UVs
  2. weld, scale to real size, decimate to a few hundred triangles (pyfqmr)
  3. split big flat faces only where the texture has detail (windows, doors, stripes), colour every face from the texture
  4. grade (lift the baked grime) and quantise to a small palette
usage: python3 -I convert.py spec.json out_prefix
spec = {"packs":{"key":"path.glb"},"models":[{name,pack,nodes:[regex],comps:[idx]|null,min_faces,
        height|width|depth|long (m), yaw (deg), tris, colors, sat, gain, gamma, detail (0..1), keep_floor, keep_alpha}]}
writes out_prefix.bin + out_prefix.json in the FRM layout: int16 positions /1000, uint8 sRGB colours, triangle soup."""
import sys, json, re
import numpy as np, trimesh
from PIL import Image
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import connected_components
from scipy.spatial import cKDTree
import pyfqmr

Image.MAX_IMAGE_PIXELS = None
_scenes, _tex = {}, {}

def scene(path):
    if path not in _scenes: _scenes[path] = trimesh.load(path, force='scene', process=False)
    return _scenes[path]

def tex_array(img):
    k = id(img)
    if k not in _tex:
        im = img.convert('RGBA')
        if max(im.size) > 2048: im.thumbnail((2048, 2048), Image.LANCZOS)
        _tex[k] = np.asarray(im).astype(np.float32) / 255.0
    return _tex[k]

def lin2srgb(c): return np.where(c <= .0031308, c * 12.92, 1.055 * np.power(np.maximum(c, 0), 1 / 2.4) - .055)

def sample(tex, uv):
    h, w = tex.shape[:2]
    u = uv[:, 0] % 1.0; v = (1.0 - uv[:, 1]) % 1.0
    x = u * (w - 1); y = v * (h - 1)
    x0 = np.floor(x).astype(int); y0 = np.floor(y).astype(int)
    x1 = np.minimum(x0 + 1, w - 1); y1 = np.minimum(y0 + 1, h - 1)
    fx = (x - x0)[:, None]; fy = (y - y0)[:, None]
    return (tex[y0, x0] * (1 - fx) * (1 - fy) + tex[y0, x1] * fx * (1 - fy) + tex[y1, x0] * (1 - fx) * fy + tex[y1, x1] * fx * fy)

class Src:
    """original textured triangles of one model: closest-surface colour lookups"""
    def __init__(self, tris, uvs, tid, texs, base):
        self.T, self.U, self.tid, self.texs, self.base = tris, uvs, tid, texs, base
        self.tree = cKDTree(tris.mean(1))
    def colour(self, Q, k=10):
        k = min(k, len(self.T))
        _, cand = self.tree.query(Q, k=k)
        if k == 1: cand = cand[:, None]
        m = len(Q)
        tr = self.T[cand.reshape(-1)]; pq = np.repeat(Q, k, axis=0)
        cp = trimesh.triangles.closest_point(tr, pq)
        d = np.linalg.norm(cp - pq, axis=1).reshape(m, k)
        best = d.argmin(1); sel = cand[np.arange(m), best]
        tri = self.T[sel]; cps = cp.reshape(m, k, 3)[np.arange(m), best]
        bc = trimesh.triangles.points_to_barycentric(tri, cps)
        bc = np.nan_to_num(bc, nan=1/3.0, posinf=1/3.0, neginf=1/3.0); bc = np.clip(bc, 0, 1); bc /= bc.sum(1, keepdims=True) + 1e-12
        uv = np.nan_to_num((self.U[sel] * bc[:, :, None]).sum(1))
        out = np.zeros((m, 4), np.float32); tid = self.tid[sel]
        for t in np.unique(tid):
            mk = tid == t
            if self.texs[t] is None: out[mk] = self.base[t]
            else: out[mk] = sample(self.texs[t], uv[mk]) * self.base[t]
        return out

def gather(spec, packs):
    sc = scene(packs[spec['pack']])
    tris, uvs, tids, texs, bases = [], [], [], [], []
    for node in sc.graph.nodes_geometry:
        if not any(re.search(rx, node) for rx in spec['nodes']): continue
        T, gname = sc.graph[node]; g = sc.geometry[gname]
        V = trimesh.transformations.transform_points(g.vertices, T); F = g.faces
        mat = getattr(g.visual, 'material', None)
        uv = getattr(g.visual, 'uv', None)
        img = getattr(mat, 'baseColorTexture', None) if mat is not None else None
        if img is None and mat is not None: img = getattr(mat, 'image', None)
        base = np.ones(4, np.float32)
        bc = getattr(mat, 'baseColorFactor', None) if mat is not None else None
        if bc is not None: base = np.asarray(bc, np.float32) / (255.0 if np.max(bc) > 1.5 else 1.0)
        if img is not None and uv is not None: tex = tex_array(img); u = uv[F]
        else:
            tex = None; u = np.zeros((len(F), 3, 2), np.float32)
        tris.append(V[F]); uvs.append(u); texs.append(tex); bases.append(base)
        tids.append(np.full(len(F), len(texs) - 1))
    if not tris: raise SystemExit('no nodes matched %s' % spec['nodes'])
    return np.concatenate(tris), np.concatenate(uvs), np.concatenate(tids), texs, bases

def components(F, nv):
    a = np.concatenate([F[:, 0], F[:, 1]]); b = np.concatenate([F[:, 1], F[:, 2]])
    nc, lab = connected_components(coo_matrix((np.ones(len(a)), (a, b)), shape=(nv, nv)), directed=False)
    return lab[F[:, 0]], nc

def kmeans(X, w, k, iters=16, seed=1):
    rng = np.random.default_rng(seed); k = min(k, len(X))
    C = X[rng.choice(len(X), k, replace=False, p=w / w.sum())].copy()
    for _ in range(iters):
        a = ((X[:, None, :] - C[None]) ** 2).sum(2).argmin(1)
        for j in range(k):
            m = a == j
            if m.any(): C[j] = (X[m] * w[m, None]).sum(0) / w[m].sum()
    return C, ((X[:, None, :] - C[None]) ** 2).sum(2).argmin(1)

def grade(rgb_lin, spec):
    S = np.clip(lin2srgb(np.clip(rgb_lin, 0, 1)), 0, 1)
    S = np.clip(S * spec.get('gain', 1.3), 0, 1) ** spec.get('gamma', .82)
    g = S.mean(-1, keepdims=True)
    return np.clip(g + (S - g) * spec.get('sat', 1.25), 0, 1)

# curated Mediterranean palette (sRGB hex): colour clusters are snapped to the nearest entry so every sourced
# model ends up in the same clean, sun-washed family instead of the muddy photo-texture browns
MED = {
    'plaster': ['f1e4c0', 'e6d2a2', 'e2bf7e', 'f0da8e', 'eab795', 'd9a08a', 'f3eee0', 'cfd8d8', 'd6b48c'],
    'roof': ['c8603c', 'b4502f', 'd97b4a', '9c4a30'],
    'stone': ['c7b99d', 'a99d86', '8d8372', '6f675a'],
    'wood': ['7a5232', '5e3f27', 'a07a4a'],
    'shutter': ['3f8078', '2f6a86', '5b9a8e', '2d4f7a'],
    'green': ['5e8c3a', '3f6b2f', '7ea04a', '2f5a3a'],
    'dark': ['2b2f38', '3a3f4a', '4a3b33'],
    'accent': ['e87ba0', 'f0c040', 'c8402f', '2b3f6b'],
    'metal': ['8a8f98', '5a5f68'],
    'rock': ['aea28c', '9a8d76', '857a64', '6e6453', '574f41'],
    'moss': ['6b8a45', '4f7035', '86a357'],
    'traffic': ['ee7a2a', 'f0f0ea', 'c4352b', '2b2b30', 'f0c030', '8a8f98', '4a4e56'],
}
def hex2rgb(h): return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], float) / 255
def srgb2lab(c):
    c = np.asarray(c, float); l = np.where(c <= .04045, c / 12.92, ((c + .055) / 1.055) ** 2.4)
    M = np.array([[.4124, .3576, .1805], [.2126, .7152, .0722], [.0193, .1192, .9505]]); xyz = l @ M.T / np.array([.95047, 1, 1.08883])
    f = np.where(xyz > .008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116)
    return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])], -1)
def lab2srgb(L):
    L = np.asarray(L, float); fy = (L[..., 0] + 16) / 116; fx = fy + L[..., 1] / 500; fz = fy - L[..., 2] / 200
    f = np.stack([fx, fy, fz], -1); xyz = np.where(f ** 3 > .008856, f ** 3, (f - 16 / 116) / 7.787) * np.array([.95047, 1, 1.08883])
    M = np.linalg.inv(np.array([[.4124, .3576, .1805], [.2126, .7152, .0722], [.0193, .1192, .9505]])); l = np.clip(xyz @ M.T, 0, 1)
    return np.where(l <= .0031308, l * 12.92, 1.055 * l ** (1 / 2.4) - .055).clip(0, 1)
def snap(pal, groups, keep=.45, lw=.7):
    """pal: (k,3) sRGB 0..1. Returns palette entries nearest in Lab (lightness weighted down), with part of the source lightness kept"""
    ents = np.array([hex2rgb(h) for g in groups for h in MED[g]]); LE = srgb2lab(ents); LP = srgb2lab(pal)
    w = np.array([lw, 1, 1]); d = (((LP[:, None, :] - LE[None]) * w) ** 2).sum(2); j = d.argmin(1)
    out = LE[j].copy(); out[:, 0] = out[:, 0] + (LP[:, 0] - out[:, 0]) * keep
    return lab2srgb(out), j

def build(spec, packs):
    tris, uvs, tid, texs, bases = gather(spec, packs)
    # drop alpha-card faces (leaves, grass cards, glass)
    src_all = None
    V = tris.reshape(-1, 3)
    # weld
    eps = max(1e-6, float(np.linalg.norm(V.max(0) - V.min(0))) * 2e-5)
    _, first, inv = np.unique(np.round(V / eps).astype(np.int64), axis=0, return_index=True, return_inverse=True)
    inv = inv.reshape(-1); W = V[first]; F = inv.reshape(-1, 3)
    keep = np.ones(len(F), bool)
    if spec.get('comps') is not None or spec.get('min_faces'):
        lab, nc = components(F, len(W)); cnt = np.bincount(lab, minlength=nc)
        if spec.get('comps') is not None:
            order = np.argsort(-cnt); keep = np.isin(lab, [order[i] for i in spec['comps']])
        else: keep = cnt[lab] >= spec['min_faces']
    F = F[keep]; tris, uvs, tid = tris[keep], uvs[keep], tid[keep]
    # orient + scale (applied to both the working mesh and the source triangles)
    yaw = np.deg2rad(spec.get('yaw', 0)); c, s = np.cos(yaw), np.sin(yaw)
    def rot(P):
        P = P.reshape(-1, 3); P = np.stack([P[:, 0] * c + P[:, 2] * s, P[:, 1], -P[:, 0] * s + P[:, 2] * c], 1)
        if spec.get('flipx'): P[:, 0] *= -1
        return P
    Wr = rot(W); tris = rot(tris).reshape(-1, 3, 3)
    if spec.get('flipx'): F = F[:, ::-1]; tris = tris[:, ::-1]; uvs = uvs[:, ::-1]
    sel = np.unique(F); mn, mx = Wr[sel].min(0), Wr[sel].max(0); sz = mx - mn
    k = 1.0
    for key, ax in (('height', 1), ('width', 0), ('depth', 2)):
        if key in spec: k = spec[key] / sz[ax]; break
    else:
        if 'long' in spec: k = spec['long'] / max(sz[0], sz[2])
    org = np.array([(mn[0] + mx[0]) / 2, mn[1], (mn[2] + mx[2]) / 2])
    Wr = (Wr - org) * k; tris = (tris - org) * k
    # faces that sit on the ground and face down are never seen
    if not spec.get('keep_floor'):
        e1 = tris[:, 1] - tris[:, 0]; e2 = tris[:, 2] - tris[:, 0]; nrm = np.cross(e1, e2); nl = np.linalg.norm(nrm, axis=1) + 1e-12
        top = tris[:, :, 1].max(1); bad = (nrm[:, 1] / nl < -.8) & (top < .08 * max(1.0, tris[:, :, 1].max()))
        tris, uvs, tid = tris[~bad], uvs[~bad], tid[~bad]
        F = F[~bad]
    src = Src(tris, uvs, tid, texs, bases)
    # decimate the welded mesh
    u, inv2 = np.unique(F, return_inverse=True); Wd = Wr[u]; Fd = inv2.reshape(-1, 3)
    target = int(spec.get('tris', 600))
    if len(Fd) > target:
        sm = pyfqmr.Simplify(); sm.setMesh(Wd.astype(np.float64), Fd.astype(np.int32))
        sm.simplify_mesh(target_count=target, aggressiveness=spec.get('aggr', 7), preserve_border=spec.get('border', False), verbose=False)
        V2, F2, _ = sm.getMesh(); Wd, Fd = np.asarray(V2), np.asarray(F2)
    T = Wd[Fd]
    # drop slivers / tiny floating bits
    e1 = T[:, 1] - T[:, 0]; e2 = T[:, 2] - T[:, 0]; area = .5 * np.linalg.norm(np.cross(e1, e2), axis=1)
    T = T[area > 1e-5]
    # adaptive split where the texture has detail (a few levels, inside a triangle budget)
    diag = float(np.linalg.norm(Wr[np.unique(F)].max(0) - Wr[np.unique(F)].min(0)))
    lmin = spec.get('lmin', max(.45, diag * .025)); thr = spec.get('thr', .2); maxd = spec.get('depth', 2)
    budget = int(spec.get('cap', max(len(T) * 1.6, 400)))
    def cols_of(Tt):
        P = np.concatenate([Tt.mean(1)[:, None], ((Tt + np.roll(Tt, -1, 1)) / 2), (Tt * .55 + Tt.mean(1)[:, None] * .45)], 1)  # centroid, 3 edge midpoints, 3 inset corners
        return src.colour(P.reshape(-1, 3)).reshape(len(Tt), 7, 4)
    final_T, final_C = [], []
    work = T; used = 0
    for depth in range(maxd + 1):
        if not len(work): break
        cc = cols_of(work); g = grade(cc[:, :, :3], spec)
        mean = g.mean(1); spread = np.abs(g - mean[:, None, :]).max((1, 2))
        el = np.linalg.norm(np.roll(work, -1, 1) - work, axis=2).max(1)
        want = (spread > thr) & (el > lmin * 2) & (depth < maxd)
        room = max(0, (budget - used - len(work)) // 3)
        idx = np.where(want)[0]
        if len(idx) > room: idx = idx[np.argsort(-spread[idx])[:room]]
        split = np.zeros(len(work), bool); split[idx] = True
        final_T.append(work[~split]); final_C.append(mean[~split]); used += int((~split).sum())
        sp = work[split]
        if not len(sp): break
        a, b, c3 = sp[:, 0], sp[:, 1], sp[:, 2]; ab, bc_, ca = (a + b) / 2, (b + c3) / 2, (c3 + a) / 2
        work = np.concatenate([np.stack([a, ab, ca], 1), np.stack([ab, b, bc_], 1), np.stack([ca, bc_, c3], 1), np.stack([ab, bc_, ca], 1)]); used += 0
    T = np.concatenate(final_T); S = np.concatenate(final_C)
    e1 = T[:, 1] - T[:, 0]; e2 = T[:, 2] - T[:, 0]; area = .5 * np.linalg.norm(np.cross(e1, e2), axis=1) + 1e-9
    pal, a = kmeans(S, area, spec.get('colors', 14))
    if spec.get('snap'):
        pal, _ = snap(pal, spec['snap'], spec.get('keep', .45), spec.get('lw', .7))
    S = pal[a]
    if spec.get('roof'):   # up-facing faces in the top of the model become roof tiles
        e1 = T[:, 1] - T[:, 0]; e2 = T[:, 2] - T[:, 0]; nr = np.cross(e1, e2); nr /= (np.linalg.norm(nr, axis=1, keepdims=True) + 1e-12)
        top = T.mean(1)[:, 1]; H = T[:, :, 1].max(); sel = (nr[:, 1] > spec.get('rny', .3)) & (top > H * spec.get('roofy', .55))
        rp = np.array([hex2rgb(h) for h in MED['roof']]); lum = S[sel].mean(1); idx = np.clip(((lum - lum.min()) / (np.ptp(lum) + 1e-6) * len(rp)).astype(int), 0, len(rp) - 1) if sel.any() else []
        if sel.any(): S[sel] = rp[len(rp) - 1 - idx]
    return T.reshape(-1, 3), np.repeat(S, 3, axis=0), len(T), sz * k

def main():
    spec = json.load(open(sys.argv[1])); outp = sys.argv[2]
    only = set(sys.argv[3].split(',')) if len(sys.argv) > 3 else None
    blob = bytearray(); meta = []
    for m in spec['models']:
        if only and m['name'] not in only: continue
        try: Pv, Cv, nf, osz = build(m, spec['packs'])
        except Exception as e:
            import traceback; traceback.print_exc(); print('FAIL', m['name'], e); continue
        q = np.round(Pv * 1000).astype(np.int64)
        if np.abs(q).max() > 32000: print('WARN too big', m['name'], np.abs(q).max()); q = np.clip(q, -32000, 32000)
        mn = (q.min(0) / 1000.0).tolist(); mx = (q.max(0) / 1000.0).tolist()
        off = len(blob); nv = len(Pv)
        blob += q.astype('<i2').tobytes()
        blob += np.round(Cv * 255).astype(np.uint8).tobytes()
        meta.append({'n': m['name'], 'nv': nv, 'off': off, 'min': mn, 'size': [mx[i] - mn[i] for i in range(3)]})
        print('%-22s tris %5d  size %.1f x %.1f x %.1f' % (m['name'], nf, *(mx[i] - mn[i] for i in range(3))))
    open(outp + '.bin', 'wb').write(blob); json.dump(meta, open(outp + '.json', 'w'), separators=(',', ':'))
    print('wrote', outp, len(blob) // 1024, 'KB', len(meta), 'models')

if __name__ == '__main__': main()
