from shot import run,W
steps=[('wait',12000),('shot','t0'),('js',"(()=>{dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter'}));return 1})()"),('wait',2500),('js',"(()=>{dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',code:'Escape'}));return 1})()"),('wait',2500),('shot','m1'),
('js',"(()=>{PT8.renderResults({mode:'race',title:'Race Result',sub:'Road Atlanta',notes:[],pay:[{l:'Finish',v:1000}],total:1000,balance:5000,rows:[{place:1,name:'Player 1',car:'Mazda MX-5',time:92.3,best:45.1,human:true,col:'#3af'},{place:2,name:'Rival',car:'Nissan Silvia',time:94.1,best:45.9,gap:'+1.8'},{place:3,name:'Ace',car:'Datsun 240Z',time:96,best:46.2,gap:'+3.7'},{place:4,name:'Zed',car:'BMW M3',time:99,best:47,gap:'+6.7'}]});return 1})()"),
('wait',2500),('shot','m2')]
run(W+'/Poly-Tourismo.html',steps,'menu')
