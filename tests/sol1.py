from shot import run,W
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',800)]
for t in [0,1,3,7,8,14]:
    st+=[('js',"(()=>{PT8.launch({mode:'ta',track:%d,laps:1,humans:[{id:'merc',alt:0,name:'T'}],ai:[],tod:'day',endur:false});return 1})()"%t),('wait',6500),('js',"(()=>{const T=RACE.T,x=T._bx||{segs:[],pts:[]};for(let i=0;i<30;i++)step(1/60);return RACE.T.d.name+' segs='+x.segs.length+' pts='+x.pts.length+' tun='+JSON.stringify(T.tunnels||[])})()")]
run(W+'/Poly-Tourismo.html',st,'sol1')
