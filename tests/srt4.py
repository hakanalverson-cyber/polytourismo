from shot import run,W
st=[('wait',3000),('js',"(()=>{const c=PT8.CARS[5];return Object.keys(c).join(',')+'\\n'+PT8.SORTED.map(c=>c.cls+' '+c.id+' '+c.name.slice(0,22)+' '+Math.round(PT8.pp(c))+' r'+(c.mphR||'?')+' a'+c.acc+' '+(c.hp||'')+' '+(c.cat||'')).join('\\n')})()")]
run(W+'/Poly-Tourismo.html',st,'srt4')
