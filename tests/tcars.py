import sys;sys.path.insert(0,'tests')
from shot import run
run('/home/claude/polytourismo/dist/Poly-Tourismo.html',[('js',"""JSON.stringify(PT8.CARS.filter(c=>c.cat==='TRACK').map(c=>[c.id,c.name,c.cls,c.top,c.acc,c.grip,c.real,c.rallyOnly?1:0,(PT8.gearTops(c).slice(-1)[0]*2.23694)|0]))""")],'tcars')
