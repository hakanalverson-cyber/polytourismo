import numpy as np,json,base64,re
b64=lambda a:base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()
G=json.load(open('ground.json'));L=json.load(open('lines.json'));B=np.load('boxes2.npy');PAL=np.load('pal.npy')
old=open('/home/claude/polytourismo/src/layers/imola_ref.js').read();O=json.loads(old[old.index('{'):old.rindex('}')+1])
out={'N':G['N'],'kerb':[b64(np.array(k,np.uint8)) for k in G['kerb']],
 'gr':{k:b64(np.array(G[k],np.int16)) for k in ('sand','green','asph')},
 'bx':b64(B.astype(np.int16)),'pal':[int(r)<<16|int(g)<<8|int(b) for r,g,b in np.clip(PAL,0,255).round()],
 'ln':{},'tp':O['tp'],'tk':O['tk'],'br':O['br']}
for cl,ls in L.items():
  flat=[];meta=[]
  for o in ls:
    p=np.array(o['p']);meta+=[len(p),round(o['h']*10),round(o['b']*10)];flat+=np.round(p*4).astype(int).ravel().tolist()
  out['ln'][cl]=[b64(np.array(meta,np.int16)),b64(np.array(flat,np.int16))]
js='/* Imola, measured from a 3D survey of the real circuit: every surface outline, building, stand, tent, vehicle, barrier and tree position,\n   lined up with our centreline. Positions and sizes only: every shape drawn from this is our own low-poly block, ribbon or tree.\n   kerb: per sample per side, inner then outer offset past the road edge (x10, +20; 255 none). gr: ground runs [row (1 m from z=-200), x0*4, x1*4].\n   bx: blocks [cx*4, cz*4, length*4, width*4, bottom*10, top*10 (above local ground), angle*1000, top colour, side colour, class]; pal: block colours. ln: barrier polylines [count, top*10, base*10] + points*4. */\n'
js+='window.PT8_IMREF='+json.dumps(out,separators=(',',':'))+';\n'
open('/home/claude/polytourismo/src/layers/imola_ref.js','w').write(js);print(len(js))
