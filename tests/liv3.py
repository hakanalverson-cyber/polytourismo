from shot import run,W
js="""(()=>{const S=PT8.studioDbg();const out=[];S.car.traverse(o=>{if(o.isMesh)out.push(o.name+' aLp:'+!!(o.geometry.attributes.aLp)+' liv:'+!!o.userData.livMat+' mat:'+(o.material.type)+' '+o.material.color.getHexString())});
const m=CAR_MODELS[PT8.modelOf('merc',0)];return JSON.stringify({idx:PT8.modelOf('merc',0),baked:m&&m.userData.livBaked,stock:m&&m.userData.livStock,sig:S.livSig})+'\\n'+out.join('\\n')})()"""
run(W+'/Poly-Tourismo.html',[('wait',1500),('js',"(()=>{PT8.ui.openShow('garage',{player:0,cap:null,ret:'menu'});return 1})()"),('wait',1000),('click','#shLv'),('wait',500),('click','.lvpre [data-i="1"]'),('wait',500),('js',js)],'liv')
