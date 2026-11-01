#!/bin/sh
# roads -> joins -> preview -> map -> pack (convert.py must have run; it reads ex/extra.npz from a previous fixroads run)
set -e
cd "$(dirname "$0")/.."
python3 tools/roads.py ex pack/rockport | tail -1
python3 tools/fixroads.py ex pack/rockport | tail -2
python3 tools/gprev.py pack/rockport
python3 -m http.server 8765 --bind 127.0.0.1 --directory . >/dev/null 2>&1 & SV=$!; sleep 1; node mapshot.js pack/mapshot.png; kill $SV
python3 -c "from PIL import Image;Image.open('pack/mapshot.png').convert('RGB').save('pack/map2048.jpg',quality=90)"
python3 tools/pack.py pack/rockport ex pack/rockport.frr | grep -v '^lots'
