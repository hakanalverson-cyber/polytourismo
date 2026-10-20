from shot import run,W
st=[('wait',3000),('js',"(()=>{PT8.rallyGears(true);return ['c40','c37','c91','c98'].map(i=>{const c=PT8.BYID[i];return i+' '+PT8.GT(c).map(g=>Math.round(g.top*c.mphR)).join('/')+' mph first-gear-tops'}).join(' | ')})()")]
run(W+'/Poly-Tourismo.html',st,'gt')
