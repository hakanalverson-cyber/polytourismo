"""Nurburgring Nordschleife centreline for Poly GT.

No surveyed centreline was reachable from the build machine, so the layout is rebuilt from the known corner sequence:
each section between two landmarks is drawn turtle-style (straights + constant-radius arcs, right turns positive, the lap
runs clockwise), then fitted onto approximate landmark positions so the outline matches the real map. The result is
scaled to the real 20,832 m lap. Elevation comes from approximate landmark heights (Breidscheid low point, Hohe Acht
high point, about 290 m apart).

Writes src/layers/ring_data.js (window.PT8_RING) and tests/out/ring_map.png for a visual check.
Coordinates: x = east, z = -north (game convention), 1 unit = 1 m.
"""
import math, json, os, sys
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LAP = 20832.0

# one turtle lap: ('S', metres) straight, ('C', degrees (+ right), radius) arc, ('L', name) corner label,
# ('E', metres a.s.l.) elevation key at this point, ('W', half width) width key. Headings are compass degrees.
START_HD = 325
H0 = 470.0  # game y = metres a.s.l. - H0
LAP_CMDS = [
    ('L', 'START / FINISH'), ('E', 612), ('W', 6.0), ('S', 380), ('T', 310, 400), ('S', 260), ('E', 604), ('W', 5.2),
    ('L', 'HATZENBACH'), ('T', 330, 220), ('S', 120), ('E', 598),
    ('T', 280, 62), ('S', 40), ('T', 345, 52), ('S', 40), ('T', 275, 50), ('S', 50), ('T', 335, 56), ('S', 50), ('T', 290, 72), ('E', 588),
    ('S', 220), ('L', 'HOCHEICHEN'), ('T', 335, 90), ('S', 40), ('T', 295, 95), ('E', 574),
    ('S', 160), ('L', 'QUIDDELBACHER HOHE'), ('T', 285, 420), ('S', 220), ('E', 592),
    ('L', 'FLUGPLATZ'), ('T', 315, 140), ('E', 600), ('S', 220),
    ('L', 'KOTTENBORN'), ('T', 330, 300), ('S', 120), ('T', 310, 260), ('E', 584), ('S', 260),
    ('L', 'SCHWEDENKREUZ'), ('T', 270, 220), ('E', 588), ('S', 330), ('E', 564),
    ('L', 'AREMBERG'), ('T', 30, 46, 1), ('E', 560), ('S', 90),
    ('L', 'FUCHSROHRE'), ('T', 20, 170), ('S', 220), ('T', 50, 260), ('S', 220), ('E', 492), ('T', 30, 190), ('S', 230), ('E', 512),
    ('L', 'ADENAUER FORST'), ('T', 350, 48), ('S', 28), ('T', 60, 36), ('S', 28), ('T', 20, 52), ('S', 90), ('E', 515),
    ('S', 200), ('L', 'METZGESFELD'), ('T', 345, 120), ('S', 90), ('T', 25, 130), ('S', 180), ('E', 488), ('T', 10, 210), ('S', 160),
    ('L', 'KALLENHARD'), ('T', 90, 56, 1), ('E', 462), ('S', 170),
    ('L', 'SPIEGELKURVE'), ('T', 60, 100), ('S', 80), ('T', 90, 120), ('S', 210), ('E', 420),
    ('L', 'WEHRSEIFEN'), ('T', 345, 30, -1), ('E', 400), ('S', 150), ('T', 30, 70), ('S', 120), ('E', 340),
    ('L', 'BREIDSCHEID'), ('T', 90, 44), ('E', 330), ('S', 80), ('L', 'EX-MUHLE'), ('T', 20, 44), ('E', 334), ('S', 260),
    ('L', 'LAUDA-LINKS'), ('T', 340, 90), ('E', 350), ('S', 230), ('L', 'BERGWERK'), ('T', 85, 40, 1), ('E', 366), ('S', 260),
    ('L', 'KESSELCHEN'), ('T', 65, 260), ('S', 260), ('T', 105, 250), ('S', 280), ('E', 420), ('T', 80, 300), ('S', 280), ('T', 115, 250), ('S', 220), ('E', 476),
    ('L', 'MUTKURVE'), ('T', 90, 160), ('S', 150), ('E', 488), ('L', 'KLOSTERTAL'), ('T', 180, 42, 1), ('E', 492), ('S', 120),
    ('L', 'STEILSTRECKE'), ('T', 200, 100), ('S', 120), ('E', 522),
    ('L', 'KARUSSELL'), ('T', 15, 32, -1), ('E', 532), ('S', 260), ('T', 40, 300), ('S', 160), ('E', 598),
    ('L', 'HOHE ACHT'), ('T', 100, 58, 1), ('E', 612), ('S', 120),
    ('L', 'HEDWIGSHOHE'), ('T', 60, 90), ('S', 90), ('L', 'WIPPERMANN'), ('T', 105, 70), ('S', 50), ('T', 65, 60), ('S', 50), ('T', 95, 80), ('E', 594),
    ('S', 200), ('L', 'ESCHBACH'), ('T', 185, 42, 1), ('E', 584), ('S', 240),
    ('L', 'BRUNNCHEN'), ('T', 235, 46), ('S', 110), ('T', 190, 80), ('S', 90), ('T', 200, 200), ('E', 566), ('S', 220),
    ('L', 'EISKURVE'), ('T', 170, 130), ('S', 260), ('E', 548), ('L', 'PFLANZGARTEN'), ('T', 205, 90), ('E', 540), ('S', 160),
    ('L', 'STEFAN-BELLOF-S'), ('T', 170, 110), ('S', 60), ('T', 205, 110), ('S', 280), ('E', 536),
    ('L', 'SCHWALBENSCHWANZ'), ('T', 165, 70), ('S', 40), ('T', 210, 55), ('S', 60), ('E', 540),
    ('L', 'KLEINES KARUSSELL'), ('T', 250, 36), ('S', 260), ('E', 552), ('L', 'GALGENKOPF'), ('T', 242, 110), ('E', 560), ('W', 5.6), ('S', 120),
    ('L', 'DOTTINGER HOHE'), ('S', 700), ('T', 236, 900), ('S', 600), ('T', 244, 900), ('S', 500), ('E', 600),
    ('L', 'ANTONIUSBUCHE'), ('T', 234, 600), ('S', 380), ('E', 606), ('W', 5.4),
    ('L', 'TIERGARTEN'), ('T', 212, 150), ('S', 60), ('T', 250, 150), ('S', 200), ('E', 610),
    ('L', 'HOHENRAIN'), ('T', 320, 30), ('S', 25), ('T', 265, 26), ('S', 30), ('T', 300, 40), ('S', 160), ('W', 6.0), ('T', 325, 260), ('S', 160), ('E', 612),
]


def turtle(cmds, h0):
    """returns points (east, north) in metres from (0,0), headings, labels at point indices"""
    pts, hd, labels = [(0.0, 0.0)], h0, []
    x = y = 0.0
    for c in cmds:
        if c[0] == 'L':
            labels.append((len(pts) - 1, c[1])); continue
        if c[0] == 'S':
            n = max(1, int(round(c[1] / 6)))
            for k in range(n):
                x += math.sin(hd) * c[1] / n; y += math.cos(hd) * c[1] / n; pts.append((x, y))
        else:
            ang, r = math.radians(c[1]), c[2]
            ln = abs(ang) * r; n = max(2, int(round(ln / 4)))
            for k in range(n):
                hd += ang / n
                x += math.sin(hd - ang / n / 2) * ln / n; y += math.cos(hd - ang / n / 2) * ln / n; pts.append((x, y))
    return np.array(pts), hd, labels


SF = 1.18  # straights are stretched so the corner radii stay close to real after scaling to the real lap
LT = [21000.0]


def trace(cmds, start_hd, ab=(0.0, 0.0)):
    """runs the turtle; T headings get a smooth correction a*sin + b*cos of lap position so the loop closes"""
    pts, hd, x, y, run = [(0.0, 0.0)], math.radians(start_hd), 0.0, 0.0, 0.0
    labels, ekeys, wkeys = [], [], []
    for c in cmds:
        i = len(pts) - 1
        if c[0] == 'L': labels.append((i, c[1])); continue
        if c[0] == 'E': ekeys.append((i, c[1])); continue
        if c[0] == 'W': wkeys.append((i, c[1])); continue
        if c[0] == 'S':
            ls = c[1] * SF; n = max(1, int(round(ls / 6)))
            for k in range(n):
                x += math.sin(hd) * ls / n; y += math.cos(hd) * ls / n; pts.append((x, y))
            run += ls
        else:
            if c[0] == 'T':
                ph = 2 * math.pi * run / LT[0]
                tgt = c[1] + ab[0] * math.sin(ph) + ab[1] * (math.cos(ph) - 1)
                cur = math.degrees(hd) % 360; d = (tgt - cur + 540) % 360 - 180
                if len(c) > 3 and c[3] * d < 0: d += 360 * c[3]
                c = ('C', d, c[2])
            ang, r = math.radians(c[1]), c[2]; ln = abs(ang) * r; n = max(2, int(round(ln / 3)))
            for k in range(n):
                x += math.sin(hd + ang / n / 2) * ln / n; y += math.cos(hd + ang / n / 2) * ln / n; hd += ang / n; pts.append((x, y))
            run += ln
    return np.array(pts), hd, labels, ekeys, wkeys


def solve_ab():
    ab = np.zeros(2)
    P0 = trace(LAP_CMDS, START_HD, ab)[0]; LT[0] = float(np.sum(np.linalg.norm(np.diff(P0, axis=0), axis=1)))
    if os.environ.get('RAW'): return ab
    for it in range(30):
        g = trace(LAP_CMDS, START_HD, ab)[0]; g0 = g[-1] - g[0]
        J = np.zeros((2, 2))
        for k in range(2):
            d = np.zeros(2); d[k] = .5
            g2 = trace(LAP_CMDS, START_HD, ab + d)[0]; J[:, k] = ((g2[-1] - g2[0]) - g0) / .5
        step = np.linalg.lstsq(J, -g0, rcond=None)[0]
        ab = ab + np.clip(step, -10, 10)
        if np.linalg.norm(g0) < 1: break
    print('heading correction a=%.1f b=%.1f deg' % tuple(ab))
    return ab


def build():
    ab = solve_ab()
    P, hd, labels, ekeys, wkeys = trace(LAP_CMDS, START_HD, ab)
    gap = P[-1] - P[0]
    print('net turn %.1f deg, closure gap %.0f m %.0f m' % (math.degrees(hd) - START_HD, gap[0], gap[1]))
    seg = np.linalg.norm(np.diff(P, axis=0), axis=1); cum = np.concatenate([[0], np.cumsum(seg)]); f = cum / cum[-1]
    if os.environ.get('RAW'): gap = gap * 0
    P = P - np.outer(f, gap)  # spread the closure error over the lap
    P = P[:-1]; cum = cum[:-1]
    ekeys = [(min(i, len(P) - 1), h) for i, h in ekeys]; wkeys = [(min(i, len(P) - 1), w) for i, w in wkeys]; labels = [(min(i, len(P) - 1), nm) for i, nm in labels]
    n = len(P)
    ek = sorted(ekeys); H = np.interp(cum, [cum[i] for i, _ in ek] + [cum[-1] + seg[-1]], [h for _, h in ek] + [ek[0][1]])
    wk = sorted(wkeys); W = np.interp(cum, [cum[i] for i, _ in wk] + [cum[-1] + seg[-1]], [w for _, w in wk] + [wk[0][1]])
    def smooth(arr, k):
        out = arr.copy()
        for _ in range(k):
            out = (np.roll(out, 1, 0) + 2 * out + np.roll(out, -1, 0)) / 4
        return out
    H = smooth(H, 400); W = smooth(W, 60)
    L = np.sum(np.linalg.norm(np.diff(np.vstack([P, P[:1]]), axis=0), axis=1))
    print('turtle length %.0f m -> scale %.3f' % (L, LAP / L))
    P = P * (LAP / L)
    seg = np.linalg.norm(np.diff(np.vstack([P, P[:1]]), axis=0), axis=1); cum = np.concatenate([[0], np.cumsum(seg)])
    M = int(round(cum[-1] / 12))
    s = np.linspace(0, cum[-1], M, endpoint=False)
    PP = np.stack([np.interp(s, cum, np.append(P[:, 0], P[0, 0])), np.interp(s, cum, np.append(P[:, 1], P[0, 1]))], 1)
    HH = np.interp(s, cum, np.append(H, H[0])); WW = np.interp(s, cum, np.append(W, W[0]))
    lab2 = [(int(round(cum[i] / cum[-1] * M)) % M, nm) for i, nm in labels]
    for i, nm in lab2: print('  %-20s %5.2f km  %4.0f m' % (nm, s[i] / 1000, HH[i]))
    for it in range(4000):  # cap the grade at ~15% (real worst is ~17% up, ~11% down) by relaxing only the over-steep spots
        g = np.diff(np.append(HH, HH[0])) / 12; bad = np.abs(g) > .15
        if not bad.any(): break
        for i in np.nonzero(bad)[0]:
            j = (i + 1) % M; m = (HH[i] + HH[j]) / 2; HH[i] = m + (HH[i] - m) * .9; HH[j] = m + (HH[j] - m) * .9
    for _ in range(30): HH = (np.roll(HH, 1) + 2 * HH + np.roll(HH, -1)) / 4
    md = 1e9
    for i in range(0, M, 2):
        d = np.hypot(PP[:, 0] - PP[i, 0], PP[:, 1] - PP[i, 1]); k = np.abs((np.arange(M) - i + M // 2) % M - M // 2) > 40; md = min(md, d[k].min())
    print('closest approach of two different parts of the lap: %.0f m' % md)
    g = np.diff(np.append(HH, HH[0])) / 12; print('max grade %.1f%% / %.1f%%' % (g.max() * 100, g.min() * 100))
    return PP, HH, WW, lab2


def main():
    P, H, W, labels = build()
    pts = [[round(float(p[0]), 1), round(float(-p[1]), 1), round(float(h - H0), 1), round(float(w), 2)] for p, h, w in zip(P, H, W)]
    marks = {nm: i for i, nm in labels}
    out = ('/* Nurburgring Nordschleife, rebuilt from the known corner sequence and approximate landmark positions (not a surveyed '
           'centreline): real 20,832 m lap, 1 unit = 1 m, about 290 m of elevation. Centreline, elevation and width only. */\n'
           'window.PT8_RING=' + json.dumps({'pts': pts, 'marks': marks}, separators=(',', ':')) + ';\n')
    open(os.path.join(ROOT, 'src/layers/ring_data.js'), 'w').write(out)
    print('points', len(pts), 'bytes', len(out), 'elev', H.min(), H.max())
    try:
        from PIL import Image, ImageDraw
        x0, x1, y0, y1 = P[:, 0].min(), P[:, 0].max(), P[:, 1].min(), P[:, 1].max()
        S = 900 / max(x1 - x0, y1 - y0)
        im = Image.new('RGB', (int((x1 - x0) * S) + 80, int((y1 - y0) * S) + 80), 'white'); d = ImageDraw.Draw(im)
        tp = lambda p: (40 + (p[0] - x0) * S, 40 + (y1 - p[1]) * S)
        hmin, hmax = H.min(), H.max()
        for i in range(len(P)):
            t = (H[i] - hmin) / (hmax - hmin)
            d.line([tp(P[i]), tp(P[(i + 1) % len(P)])], fill=(int(255 * t), 60, int(255 * (1 - t))), width=4)
        for i, nm in labels:
            d.text(tp(P[i]), nm, fill='black')
        os.makedirs(os.path.join(ROOT, 'tests/out'), exist_ok=True)
        im.save(os.path.join(ROOT, 'tests/out/ring_map.png'))
    except Exception as e:
        print('no png', e)


if __name__ == '__main__':
    main()
