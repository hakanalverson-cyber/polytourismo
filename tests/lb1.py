from shot import run,W
res="""(()=>{PT8.renderResults({mode:'mp',title:'RACE COMPLETE',sub:'QUARRY CIRCUIT / 3 LAPS',notes:[],pay:[{l:'Race',v:1200}],total:1200,balance:4700,cfg:{},
rows:[{place:1,name:'HAKAN',car:'BMW M4',time:182.4,best:59.8,human:true,col:'#f1f3f5'},{place:2,name:'CPU 2',car:'NISSAN GT-R (R35)',time:184.9,best:59.2},{place:3,name:'PLAYER 2',car:'FORD MUSTANG SHELBY',time:190.2,best:61.5,human:true,col:'#f2c76b'},{place:4,name:'CPU 3',car:'MAZDA RX-7',time:195.1,best:63.1}]});return 1})()"""
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',800),('js',res),('wait',1800),('shot','mp')]
run(W+'/Poly-Tourismo.html',st,'lb1')
