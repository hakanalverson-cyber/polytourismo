#!/usr/bin/env python3
"""merge FRM-layout model sets into one blob: pack.py out set1 set2 ...  (each set is a prefix of a .bin / .json pair)"""
import sys, json
out = sys.argv[1]; blob = bytearray(); meta = []
for p in sys.argv[2:]:
    b = open(p + '.bin', 'rb').read(); m = json.load(open(p + '.json')); base = len(blob); blob += b
    for x in m:
        x = dict(x); x['off'] += base; meta.append(x)
open(out + '.bin', 'wb').write(blob); json.dump(meta, open(out + '.json', 'w'), separators=(',', ':'))
print('packed', len(meta), 'models', len(blob) // 1024, 'KB ->', out)
