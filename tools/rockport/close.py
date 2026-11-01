# close the buildings: the original map only modelled the sides you see from the road, so from anywhere else
# the blocks are open shells. Per building (split into separate footprints), walk its convex hull; hull edges
# with no wall near them get a wall up to the local height, and a building with no roof gets a flat cap.
import numpy as np
from scipy import ndimage
from scipy.spatial import ConvexHull, cKDTree

def close(P, O, K):
    nrm = np.cross(P[:, 1] - P[:, 0], P[:, 2] - P[:, 0]); nl = np.linalg.norm(nrm, axis=1) + 1e-9; ny = np.abs(nrm[:, 1]) / nl
    sel = np.where(K == 1)[0]
    order = sel[np.argsort(O[sel], kind='stable')]
    oo = O[order]; cuts = np.flatnonzero(np.diff(oo)) + 1
    groups = np.split(order, cuts)
    newP = []; newO = []; nwall = 0; ncap = 0
    for g in groups:
        T = P[g]; V = T.reshape(-1, 3)
        ymin = V[:, 1].min()
        if V[:, 1].max() - ymin < 3: continue
        # separate footprints: 2 m raster of the vertices, dilated, labelled
        x0, z0 = V[:, 0].min() - 4, V[:, 2].min() - 4
        gi = ((V[:, 0] - x0) / 2).astype(int); gj = ((V[:, 2] - z0) / 2).astype(int)
        if gi.max() > 400 or gj.max() > 400: continue
        M = np.zeros((gj.max() + 3, gi.max() + 3), bool); M[gj, gi] = True
        L, nlab = ndimage.label(ndimage.binary_dilation(M, iterations=2))
        vl = L[gj, gi]
        tl = vl.reshape(-1, 3)[:, 0]
        for lab in range(1, nlab + 1):
            vm = vl == lab
            if vm.sum() < 6: continue
            Vc = V[vm]; tm = tl == lab; Tc = T[tm]; nyc = ny[g][tm]
            ymn = Vc[:, 1].min(); ymx = Vc[:, 1].max()
            if ymx - ymn < 3: continue
            xz = Vc[:, [0, 2]]
            try: hull = ConvexHull(xz)
            except Exception: continue
            area = hull.volume
            if area < 12 or area > 12000: continue
            H = np.percentile(Vc[:, 1], 95)
            # walls already there: sample the horizontal extent of the near-vertical faces
            vert = Tc[nyc < .35]
            samp = []
            for t in vert:
                for a, b in ((0, 1), (1, 2), (2, 0)):
                    p, q = t[a, [0, 2]], t[b, [0, 2]]; d = np.linalg.norm(q - p)
                    n = max(2, int(d / .7) + 1); s = np.linspace(0, 1, n)[:, None]
                    samp.append(p + (q - p) * s)
            wk = cKDTree(np.concatenate(samp)) if samp else None
            vk = cKDTree(xz)
            # roof: up-facing faces above the ground floor covering less than 40 % of the footprint -> flat cap at H (walls then go up to it)
            up = Tc[(nyc > .7)]
            if len(up):
                upm = up[up[:, :, 1].mean(1) > ymn + 2.5]
                u1 = upm[:, 1] - upm[:, 0]; u2 = upm[:, 2] - upm[:, 0]; ua = np.abs(u1[:, 0] * u2[:, 2] - u1[:, 2] * u2[:, 0]).sum() / 2 if len(upm) else 0
            else: ua = 0
            capit = ua < .4 * area and (ua < .08 * area or area < 500)
            hv = hull.vertices; ring = xz[hv]
            for e in range(len(ring)):
                p, q = ring[e], ring[(e + 1) % len(ring)]; d = np.linalg.norm(q - p)
                if d < .8: continue
                n = max(2, int(d / 1.0) + 1); s = np.linspace(0, 1, n); pts = p + (q - p) * s[:, None]
                cov = np.zeros(n, bool) if wk is None else wk.query(pts, distance_upper_bound=1.4)[0] < 1.4
                # runs of uncovered samples
                k = 0
                while k < n - 1:
                    if cov[k] and cov[k + 1]: k += 1; continue
                    j = k + 1
                    while j < n - 1 and not (cov[j] and cov[j + 1]): j += 1
                    a, b = pts[k], pts[j]
                    if np.linalg.norm(b - a) > .6:
                        nb = vk.query_ball_point((a + b) / 2, r=max(5., np.linalg.norm(b - a) / 2 + 2))
                        h = min(Vc[nb, 1].max() if nb else H, H) if len(nb) else H
                        h = H if capit else max(h, ymn + 3)
                        y0 = ymn - .6
                        A = [a[0], y0, a[1]]; B = [b[0], y0, b[1]]; C2 = [b[0], h, b[1]]; D2 = [a[0], h, a[1]]
                        newP += [[A, B, C2], [A, C2, D2]]; newO += [O[g[0]]] * 2; nwall += 2
                    k = j
            if capit:
                c = ring.mean(0)
                for e in range(len(ring)):
                    p, q = ring[e], ring[(e + 1) % len(ring)]
                    newP.append([[c[0], H, c[1]], [p[0], H, p[1]], [q[0], H, q[1]]]); newO.append(O[g[0]]); ncap += 1
    print('closed buildings: walls', nwall, 'cap tris', ncap)
    if not newP: return np.zeros((0, 3, 3)), np.zeros(0, np.int64)
    return np.array(newP, np.float64), np.array(newO, np.int64)
