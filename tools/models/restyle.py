#!/usr/bin/env python3
"""Re-colour the CC0 vertex-coloured building / tree models (assets/bld.bin) into the Mediterranean palette used by
the island kit: pitched roofs become terracotta, walls take a washed plaster colour, glass turns pale teal, frames and
doors stay dark / wooden, saturated awnings snap to the teal / red accents.  Geometry is untouched.

usage: python3 -I restyle.py out_prefix        (writes out_prefix.bin / out_prefix.json in the FRM layout)
Colours are written as painted sRGB bytes; the game's FRM loader decodes them with pow 2.1 like every other model."""
import sys, json, os, hashlib
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from convert import MED, hex2rgb, srgb2lab, lab2srgb

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(HERE, '..', '..', 'assets')

# per model: wall colour (hex), roof palette index offset, flags
RULES = {
    'ResidentBuilding_01': dict(wall='e2bf7e', as_='md_house_a'),
    'ResidentBuilding_02': dict(wall='f1e4c0', as_='md_house_b'),
    'ResidentBuilding_03': dict(wall='eab795', as_='md_house_c'),
    'ResidentBuilding_04': dict(wall='f3eee0', as_='md_house_d'),
    'ResidentBuilding_05': dict(wall='d9a08a', as_='md_house_e'),
    'ResidentBuilding_06': dict(wall='e6d2a2', as_='md_house_f'),
    'CommercialBuilding_01': dict(wall='f1e4c0', as_='md_shop_a', flat='cfd8d8'),
    'CommercialBuilding_02': dict(wall='e2bf7e', as_='md_shop_b'),
    'CommercialBuilding_03': dict(wall='f3eee0', as_='md_shop_c', flat='c9bda4'),
    'CompanyBuilding_01': dict(wall='f3eee0', as_='md_hotel_a', flat='cfd8d8'),
    'CompanyBuilding_02': dict(wall='f1e4c0', as_='md_hotel_b', flat='cfd8d8'),
    'CompanyBuilding_03': dict(wall='eab795', as_='md_hotel_c', flat='cfd8d8'),
    'CompanyBuilding_04': dict(wall='f3eee0', as_='md_hotel_d', flat='cfd8d8'),
    'StoreBuilding_01': dict(wall='e6d2a2', as_='md_store', flat='c9bda4'),
    'FarmerHouse': dict(wall='e6d2a2', as_='md_farm', base='a99d86'),
    'Barn_01': dict(wall='c9bda4', as_='md_barn_a', base='8d8372'),
    'Barn_02': dict(wall='d6b48c', as_='md_barn_b', base='8d8372'),
    'Well_02': dict(wall='a99d86', as_='md_well', stone=True),
    'WoodFence_02': dict(wall='a07a4a', as_='md_fence', wood=True),
    'Haystack_01': dict(wall='e2bf7e', as_='md_hay_a', hay=True),
    'Haystack_04': dict(wall='e2bf7e', as_='md_hay_b', hay=True),
    'WoodenCrates_01': dict(wall='a07a4a', as_='md_crates', wood=True),
    'Tree_05': dict(as_='md_cypress_a', tree='cypress'),
    'Tree_04': dict(as_='md_cypress_b', tree='cypress'),
    'Tree_02': dict(as_='md_olive', tree='olive'),
    'Tree_07': dict(as_='md_pine_s', tree='pine'),
    'Bush_01': dict(as_='md_bush_a', tree='bush'),
    'Bush_02': dict(as_='md_bush_b', tree='bush'),
}

def load_bld():
    meta = json.load(open(os.path.join(ASSETS, 'bld.json')))
    raw = open(os.path.join(ASSETS, 'bld.bin'), 'rb').read()
    out = {}
    for m in meta:
        nv, ni = m['nv'], m['ni']
        pos = np.frombuffer(raw, dtype='<i2', count=nv * 3, offset=m['off']).reshape(-1, 3).astype(np.float64) / 1000.0
        col = np.frombuffer(raw, dtype='u1', count=nv * 3, offset=m['off'] + nv * 6).reshape(-1, 3).astype(np.float64) / 255.0
        idx = np.frombuffer(raw, dtype='<u2', count=ni, offset=m['ioff']).astype(np.int64)
        out[m['name']] = (pos[idx].reshape(-1, 3, 3), col[idx].reshape(-1, 3, 3).mean(1))   # triangles, per-triangle in-game linear colour
    return out

def lum(S): return S @ np.array([.2126, .7152, .0722])

def pick(hexes, S, keep=.35):
    """nearest palette entry (Lab, lightness weighted down), keeping a share of the source lightness"""
    ents = np.array([hex2rgb(h) for h in hexes]); LE = srgb2lab(ents); LP = srgb2lab(S)
    d = (((LP[:, None, :] - LE[None]) * np.array([.5, 1, 1])) ** 2).sum(2); j = d.argmin(1)
    o = LE[j].copy(); o[:, 0] += (LP[:, 0] - o[:, 0]) * keep
    return lab2srgb(o)

def tone(base, L, mean, k=.9):
    """base colour modulated by how much lighter / darker the source triangle was than the model's average"""
    f = np.clip(1 + (L - mean) * k, .62, 1.12)
    return np.clip(base[None, :] * f[:, None], 0, 1)

def restyle(name, rule, T, Cl):
    S = np.clip(Cl, 0, 1) ** (1 / 2.1)                      # painted colour the artist chose
    e1 = T[:, 1] - T[:, 0]; e2 = T[:, 2] - T[:, 0]; nr = np.cross(e1, e2); nr /= np.linalg.norm(nr, axis=1, keepdims=True) + 1e-12
    cy = T.mean(1)[:, 1]; H = max(float(T[:, :, 1].max()), 1e-3); ny = nr[:, 1]
    L = lum(S); mx = S.max(1); mn = S.min(1); sat = (mx - mn) / (mx + 1e-6)
    out = S.copy()
    if rule.get('tree'):
        kind = rule['tree']; g = MED['green']
        pal = {'cypress': ['2f5a3a', '3f6b2f'], 'olive': ['7a8f58', '5f7a42', '8fa066'], 'pine': ['2f5a3a', '3f6b2f'], 'bush': ['5e8c3a', '3f6b2f', '7ea04a']}[kind]
        trunk = (L < .30) & (sat > .15) & (S[:, 0] > S[:, 1] * .9)         # brown trunk faces
        leaf = ~trunk
        out[leaf] = pick(pal, S[leaf], keep=.5)
        out[trunk] = pick(MED['wood'], S[trunk], keep=.4)
        return T, out, 0.0
    if rule.get('hay'):
        out = pick(['e2bf7e', 'd6b48c', 'c4a060', '7a5232'], S, keep=.4); return T, out, 0.0
    if rule.get('wood'):
        out = pick(MED['wood'] + ['c4a060'], S, keep=.5); return T, out, 0.0
    if rule.get('stone'):
        out = pick(MED['stone'] + ['c9bda4', '5a5f68'], S, keep=.45); return T, out, 0.0
    wall = hex2rgb(rule['wall'])
    roof = (ny > .22) & (cy > .42 * H)
    glass = (S[:, 2] > S[:, 0] * 1.2) & (S[:, 2] > S[:, 1] * .9) & (sat > .22) & ~roof
    flat = roof & (ny > .9) & (cy > .86 * H)                         # flat tops of the office blocks
    pitched = roof & ~flat
    dark = (L < .2) & ~roof & ~glass
    wood = (~roof) & (~glass) & (~dark) & (sat > .3) & (L < .5) & (S[:, 0] > S[:, 2] * 1.3) & (cy < .5 * H)
    accent = (~roof) & (~glass) & (~dark) & (~wood) & (sat > .42)
    base = rule.get('base') and (cy < .12 * H) & ~glass & ~roof & ~dark
    wall_m = ~(roof | glass | dark | wood | accent) & ~(base if base is not False and base is not None else np.zeros(len(T), bool))
    rp = np.array([hex2rgb(h) for h in MED['roof']])
    if pitched.any():
        r = (L[pitched] - L[pitched].min()) / (np.ptp(L[pitched]) + 1e-6)
        seed = int(hashlib.md5(name.encode()).hexdigest()[:4], 16) % 3
        out[pitched] = rp[(seed + (r * 2).round().astype(int)) % 3] if np.ptp(L[pitched]) > .02 else rp[seed]
        out[pitched] = np.clip(out[pitched] * (.92 + .1 * np.clip(ny[pitched], 0, 1)[:, None]), 0, 1)
    if flat.any(): out[flat] = hex2rgb(rule.get('flat', 'c9bda4'))
    if glass.any(): out[glass] = pick(['5b7f92', '4a6f86', '6e93a3'], S[glass], keep=.55)
    if dark.any(): out[dark] = pick(MED['dark'], S[dark], keep=.5)
    if wood.any(): out[wood] = pick(MED['wood'], S[wood], keep=.45)
    if accent.any(): out[accent] = pick(MED['shutter'] + ['c8402f', 'f3eee0'], S[accent], keep=.4)
    if base is not False and base is not None and base.any(): out[base] = hex2rgb(rule['base'])
    if wall_m.any():
        m = float(L[wall_m].mean()); out[wall_m] = tone(wall, L[wall_m], m)
    # the front is the side with the door (brown faces), else the awning, else the lowest windows
    cen = T.mean(1); mid = (T.reshape(-1, 3).min(0) + T.reshape(-1, 3).max(0)) / 2
    for sel in (wood & (cy < .4 * H), accent & (cy < .6 * H), glass & (cy < .35 * H)):
        if sel.sum() >= 2:
            d = cen[sel][:, [0, 2]] - mid[[0, 2]]; w = np.linalg.norm(d, axis=1); v = (d * w[:, None]).sum(0)
            if np.linalg.norm(v) > 1e-3: return T, out, float(np.arctan2(v[0], v[1]))
    return T, out, 0.0

def main():
    outp = sys.argv[1]; src = load_bld(); blob = bytearray(); meta = []
    for k, rule in RULES.items():
        if k not in src: print('missing', k); continue
        T, C, fr = restyle(k, rule, *src[k])
        P = T.reshape(-1, 3); q = np.round(P * 1000).astype(np.int64)
        mn = (q.min(0) / 1000.0).tolist(); mx = (q.max(0) / 1000.0).tolist()
        off = len(blob); blob += q.astype('<i2').tobytes()
        blob += np.round(np.repeat(C, 3, axis=0) * 255).astype(np.uint8).tobytes()
        meta.append({'n': rule['as_'], 'nv': len(P), 'off': off, 'min': mn, 'size': [mx[i] - mn[i] for i in range(3)], 'fr': round(fr, 3)})
        print('%-16s %5d tris  %.1f x %.1f x %.1f' % (rule['as_'], len(T), *(mx[i] - mn[i] for i in range(3))))
    open(outp + '.bin', 'wb').write(blob); json.dump(meta, open(outp + '.json', 'w'), separators=(',', ':'))
    print('wrote', outp, len(blob) // 1024, 'KB', len(meta), 'models')

if __name__ == '__main__': main()
