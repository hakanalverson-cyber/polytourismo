from shot import run,W
base="""(()=>{document.getElementById('play').click();return 1})()"""
def css(c):return "(()=>{let s=document.getElementById('xcss');if(!s){s=document.createElement('style');s.id='xcss';document.head.appendChild(s)}s.textContent=`%s`;return 1})()"%c
ORD="career:1;rally:2;track:3;ta:4;mp:5;cutup:6;elim:7"
def orders(m):return ''.join("#s8cards .card[data-m=%s]{order:%s !important}"%(k,v) for k,v in (x.split(':') for x in m.split(';')))
o1=orders(ORD)+"""
#s8cards .cards{display:grid !important;grid-template-columns:repeat(3,1fr);grid-template-rows:1fr 86px;gap:14px !important;top:15vh !important;bottom:12vh !important;padding:0 3.4vw !important}
#s8cards .card{flex:none !important;max-width:none !important;width:auto !important;min-width:0 !important}
#s8cards .card:nth-child(n){}
#s8cards .card[data-m=ta],#s8cards .card[data-m=mp],#s8cards .card[data-m=cutup],#s8cards .card[data-m=elim]{grid-row:2;min-height:0 !important}
#s8cards .card[data-m=ta]{grid-column:1}
"""
# 4 small cards in a strip: use a nested approach with grid 12 columns
o1=orders(ORD)+"""
#s8cards .cards{display:grid !important;grid-template-columns:repeat(12,1fr);grid-template-rows:1fr 92px;gap:14px !important;top:15vh !important;bottom:12vh !important;padding:0 3.4vw !important;align-items:stretch !important}
#s8cards .card{flex:none !important;max-width:none !important;width:auto !important;min-width:0 !important;height:auto !important}
#s8cards .card[data-m=career],#s8cards .card[data-m=rally],#s8cards .card[data-m=track]{grid-column:span 4;grid-row:1}
#s8cards .card[data-m=ta],#s8cards .card[data-m=mp],#s8cards .card[data-m=cutup],#s8cards .card[data-m=elim]{grid-column:span 3;grid-row:2}
#s8cards .card[data-m=ta] .ico,#s8cards .card[data-m=mp] .ico,#s8cards .card[data-m=cutup] .ico,#s8cards .card[data-m=elim] .ico{transform:scale(.4) !important;position:absolute;left:8px;top:50%;margin-top:-24px;opacity:.9}
#s8cards .card[data-m=ta] .tx,#s8cards .card[data-m=mp] .tx,#s8cards .card[data-m=cutup] .tx,#s8cards .card[data-m=elim] .tx{left:64px !important}
#s8cards .card[data-m=ta] .num,#s8cards .card[data-m=mp] .num,#s8cards .card[data-m=cutup] .num,#s8cards .card[data-m=elim] .num{display:none}
"""
o2=orders(ORD)+"""
#s8cards .cards{justify-content:center !important;gap:2vw !important}
#s8cards .card[data-m=ta],#s8cards .card[data-m=mp],#s8cards .card[data-m=cutup],#s8cards .card[data-m=elim]{display:none !important}
#s8cards .card{flex:1 1 0 !important;max-width:30vw !important}
#s8cards:after{content:'MAIN  |  QUICK PLAY  (Time Attack / Multiplayer / Cut-Up / Elimination)';position:absolute;left:3.4vw;top:11vh;font:700 11px monospace;letter-spacing:.3em;color:#8a949c}
"""
o3=orders("ta:1;mp:2;cutup:3;elim:4;rally:5;track:6;career:7")+"""
#s8cards .card[data-m=ta],#s8cards .card[data-m=mp],#s8cards .card[data-m=cutup],#s8cards .card[data-m=elim]{flex:.55 1 0 !important}
#s8cards .card[data-m=rally],#s8cards .card[data-m=track],#s8cards .card[data-m=career]{flex:1.7 1 0 !important}
#s8cards .card[data-m=ta] h3,#s8cards .card[data-m=mp] h3,#s8cards .card[data-m=cutup] h3,#s8cards .card[data-m=elim] h3{font-size:.8em !important}
#s8cards .card[data-m=ta] .sub,#s8cards .card[data-m=mp] .sub,#s8cards .card[data-m=cutup] .sub,#s8cards .card[data-m=elim] .sub{display:none}
#s8cards .card[data-m=ta] .ico,#s8cards .card[data-m=mp] .ico,#s8cards .card[data-m=cutup] .ico,#s8cards .card[data-m=elim] .ico{transform:scale(.55) !important}
"""
st=[('wait',2500),('js',base),('wait',1200),('shot','cur')]
for n,c in(('o1',o1),('o2',o2),('o3',o3)):
    st+=[('js',css(c)),('wait',700),('shot',n)]
run(W+'/Poly-Tourismo.html',st,'cards3')
